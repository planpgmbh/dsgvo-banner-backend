require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { initDatabase } = require('./config/database.cjs');

// Route Imports
const authRoutes = require('./routes/authRoutes.cjs');
const publicRoutes = require('./routes/publicRoutes.cjs');
const projectRoutes = require('./routes/projectRoutes.cjs');
const cookieRoutes = require('./routes/cookieRoutes.cjs');
const analyticsRoutes = require('./routes/analyticsRoutes.cjs');

// Check for essential environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', true); // Trust the X-Forwarded-For header
const PORT = process.env.PORT || 3001;

// --- Middleware ---

// Security
app.use(helmet());

// CORS Configuration - Production Ready
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, use CORS_ORIGIN environment variable
    if (process.env.NODE_ENV === 'production' && process.env.CORS_ORIGIN) {
      const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    }
    
    // In development, allow all origins for banner integration testing
    return callback(null, true);
  },
  credentials: false, // No cookies needed for public banner integration
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json());

// Rate Limiting
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 100, // 100 requests
  duration: 60, // per 1 minute by IP
});
const rateLimitMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).json({ error: 'Too many requests' }));
};
app.use(rateLimitMiddleware);


// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};


// --- API Routes ---
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects/:projectId', authenticateToken, analyticsRoutes); // for /consent-logs and /analytics
app.use('/api/projects/:projectId/cookies', authenticateToken, cookieRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);


// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('💥 UNHANDLED ERROR', err);
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }
  
  // Database errors
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      error: 'Database Error',
      message: process.env.NODE_ENV === 'production' ? 'Database operation failed' : err.message
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }
  
  // Generic server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});


// --- Server Startup ---
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`CORS is open. In production, set CORS_ORIGIN environment variable.`);
    }
  });
});

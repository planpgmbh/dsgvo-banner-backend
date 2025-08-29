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

// CORS - Allow all origins for public routes
const corsOptions = {
  origin: '*', // Allow all origins
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
  
  // Send a generic error message
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message, // In development, you might want to see the message
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

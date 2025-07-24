const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  if (users.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = users[0];
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token, user: { id: user.id, username: user.username } });
});

module.exports = {
  login
};

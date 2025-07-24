const { pool } = require('../config/database.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const createConsentLog = catchAsync(async (req, res) => {
  const { project_id, consents, ip } = req.body;

  if (!project_id || !consents || !ip) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Pseudonymize IP
  const pseudoIp = ip.split('.').slice(0, 3).join('.') + '.0';

  // Get project expiry duration
  const [projects] = await pool.execute('SELECT expiry_months FROM projects WHERE id = ?', [project_id]);
  if (projects.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const expiryMonths = projects[0].expiry_months || 12;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

  // Save consent
  await pool.execute(`
    INSERT INTO consent_logs (project_id, consents, ip_pseudonymized, expires_at)
    VALUES (?, ?, ?, ?)
  `, [project_id, JSON.stringify(consents), pseudoIp, expiryDate]);

  res.status(201).json({ 
    success: true, 
    expires_at: expiryDate.toISOString() 
  });
});

module.exports = {
  createConsentLog
};

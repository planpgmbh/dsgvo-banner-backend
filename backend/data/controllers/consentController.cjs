const { pool } = require('../config/database.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const createConsentLog = catchAsync(async (req, res) => {
  const { project_id, accepted_services, accepted_category_names, is_accept_all } = req.body;
  let ip = req.ip; // Get IP from the request object

  // Handle IPv6-mapped IPv4 addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Pseudonymize IP: mask only the last block (IPv4: last octet, IPv6: last hextet)
  const pseudonymizeIp = (addr) => {
    try {
      if (!addr) return 'UNKNOWN';
      if (addr.includes(':')) { // IPv6
        const parts = addr.split(':');
        // Replace only the last hextet with XXXX, keep others as-is
        if (parts.length > 0) {
          parts[parts.length - 1] = 'XXXX';
          return parts.join(':');
        }
        return 'UNKNOWN';
      }
      // IPv4
      const oct = addr.split('.');
      if (oct.length === 4) return `${oct[0]}.${oct[1]}.${oct[2]}.XXX`;
      return 'UNKNOWN';
    } catch (_) { return 'UNKNOWN'; }
  };
  const pseudoIp = pseudonymizeIp(ip);

  // Get project expiry duration
  const [projects] = await pool.execute('SELECT expiry_months FROM projects WHERE id = ?', [project_id]);
  if (projects.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const expiryMonths = projects[0].expiry_months || 12;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

  // Save consent
  const consentsPayload = {
    accepted_services,
    accepted_category_names: accepted_category_names || [],
    is_accept_all,
    user_agent: req.headers['user-agent']
  };

  await pool.execute(`
    INSERT INTO consent_logs (project_id, consents, ip_pseudonymized, expires_at)
    VALUES (?, ?, ?, ?)
  `, [project_id, JSON.stringify(consentsPayload), pseudoIp, expiryDate]);

  res.status(201).json({ 
    success: true, 
    expires_at: expiryDate.toISOString() 
  });
});

module.exports = {
  createConsentLog
};

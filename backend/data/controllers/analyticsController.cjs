const { pool } = require('../config/database.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const getConsentLogs = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const [logs] = await pool.execute(
    'SELECT * FROM consent_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [projectId, parseInt(limit), offset]
  );

  const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM consent_logs WHERE project_id = ?', [projectId]);

  res.json({
    logs,
    total: countResult[0].total,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

const getProjectAnalytics = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  // Placeholder for more complex analytics
  const [totalConsents] = await pool.execute(
    'SELECT COUNT(*) as total FROM consent_logs WHERE project_id = ?',
    [projectId]
  );

  // This is a very basic analytic. A real implementation might involve more complex queries.
  const analytics = {
    totalConsents: totalConsents[0].total,
    // More stats can be added here
  };

  res.json(analytics);
});


module.exports = {
  getConsentLogs,
  getProjectAnalytics,
};

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

  try {
    // Total consents
    const [totalConsents] = await pool.execute(
      'SELECT COUNT(*) as total FROM consent_logs WHERE project_id = ?',
      [projectId]
    );

  // Accept All vs Selective consents
  // Use JSON boolean comparison to avoid CAST issues with true/false
  const [consentTypes] = await pool.execute(`
    SELECT 
      CASE WHEN JSON_EXTRACT(consents, '$.is_accept_all') = true THEN 1 ELSE 0 END as is_accept_all,
      COUNT(*) as count
    FROM consent_logs 
    WHERE project_id = ? 
    GROUP BY is_accept_all
  `, [projectId]);


  // Daily consent trends (last 30 days)
  const [dailyTrends] = await pool.execute(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_consents,
      SUM(CASE WHEN JSON_EXTRACT(consents, '$.is_accept_all') = true THEN 1 ELSE 0 END) as accept_all_count,
      SUM(CASE WHEN JSON_EXTRACT(consents, '$.is_accept_all') = false THEN 1 ELSE 0 END) as selective_count
    FROM consent_logs 
    WHERE project_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `, [projectId]);

    // Calculate summary statistics with percentages
    const totalConsentCount = totalConsents[0].total;
    // Rows return is_accept_all as 1 or 0; select explicitly
    const acceptAllRow = consentTypes.find(row => row.is_accept_all === 1);
    const selectiveRow = consentTypes.find(row => row.is_accept_all === 0);
    const acceptAllCount = acceptAllRow ? acceptAllRow.count : 0;
    const selectiveCount = selectiveRow ? selectiveRow.count : 0;
    
    const analytics = {
      totalConsents: totalConsentCount,
      consentTypes: consentTypes.map(row => ({
        type: row.is_accept_all ? 'accept_all' : 'selective',
        count: row.count,
        percentage: totalConsentCount > 0 ? Math.round((row.count / totalConsentCount) * 100) : 0
      })),
      dailyTrends: dailyTrends,
      summary: {
        acceptAllRate: acceptAllCount,
        acceptAllPercentage: totalConsentCount > 0 ? Math.round((acceptAllCount / totalConsentCount) * 100) : 0,
        selectiveRate: selectiveCount,
        selectivePercentage: totalConsentCount > 0 ? Math.round((selectiveCount / totalConsentCount) * 100) : 0,
        totalConsents: totalConsentCount
      }
    };

    res.json(analytics);

  } catch (error) {
    // Fallback analytics if queries fail
    console.error('Analytics query error:', error);
    res.json({
      totalConsents: 0,
      consentTypes: [],
      dailyTrends: [],
      summary: {
        acceptAllRate: 0,
        acceptAllPercentage: 0,
        selectiveRate: 0,
        selectivePercentage: 0,
        totalConsents: 0
      },
      error: 'Analytics temporarily unavailable'
    });
  }
});


module.exports = {
  getConsentLogs,
  getProjectAnalytics,
};

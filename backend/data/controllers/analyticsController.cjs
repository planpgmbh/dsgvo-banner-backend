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
  const [consentTypes] = await pool.execute(`
    SELECT 
      CAST(JSON_EXTRACT(consents, '$.is_accept_all') AS UNSIGNED) as is_accept_all,
      COUNT(*) as count
    FROM consent_logs 
    WHERE project_id = ? 
    GROUP BY is_accept_all
  `, [projectId]);

  // Category acceptance rates  
  const [categoryStats] = await pool.execute(`
    SELECT 
      category_name,
      SUM(CASE WHEN JSON_CONTAINS(JSON_EXTRACT(consents, '$.accepted_category_names'), JSON_QUOTE(category_name)) THEN 1 ELSE 0 END) as accepted_count,
      COUNT(*) as total_consents,
      ROUND(
        (SUM(CASE WHEN JSON_CONTAINS(JSON_EXTRACT(consents, '$.accepted_category_names'), JSON_QUOTE(category_name)) THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 
        2
      ) as acceptance_rate
    FROM consent_logs cl
    CROSS JOIN (
      SELECT 'necessary' as category_name
      UNION SELECT 'preferences'  
      UNION SELECT 'analytics'
      UNION SELECT 'marketing'
    ) categories
    WHERE cl.project_id = ?
    GROUP BY category_name
  `, [projectId]);

  // Daily consent trends (last 30 days)
  const [dailyTrends] = await pool.execute(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_consents,
      SUM(CASE WHEN CAST(JSON_EXTRACT(consents, '$.is_accept_all') AS UNSIGNED) = 1 THEN 1 ELSE 0 END) as accept_all_count,
      SUM(CASE WHEN CAST(JSON_EXTRACT(consents, '$.is_accept_all') AS UNSIGNED) = 0 THEN 1 ELSE 0 END) as selective_count
    FROM consent_logs 
    WHERE project_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `, [projectId]);

    const analytics = {
      totalConsents: totalConsents[0].total,
      consentTypes: consentTypes.map(row => ({
        type: row.is_accept_all ? 'accept_all' : 'selective',
        count: row.count
      })),
      categoryStats: categoryStats,
      dailyTrends: dailyTrends,
      summary: {
        acceptAllRate: consentTypes.find(row => row.is_accept_all)?.count || 0,
        selectiveRate: consentTypes.find(row => !row.is_accept_all)?.count || 0
      }
    };

    res.json(analytics);

  } catch (error) {
    // Fallback analytics if queries fail
    console.error('Analytics query error:', error);
    res.json({
      totalConsents: 0,
      consentTypes: [],
      categoryStats: [],
      dailyTrends: [],
      summary: {
        acceptAllRate: 0,
        selectiveRate: 0
      },
      error: 'Analytics temporarily unavailable'
    });
  }
});


module.exports = {
  getConsentLogs,
  getProjectAnalytics,
};

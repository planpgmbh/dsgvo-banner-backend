const { pool } = require('../config/database.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const createCookieService = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const {
    name,
    description,
    provider,
    cookie_names,
    script_code,
    privacy_policy_url,
    retention_period,
    purpose,
    category_id
  } = req.body;

  // Authorization check: Does the project exist?
  const [projects] = await pool.execute('SELECT id FROM projects WHERE id = ?', [projectId]);
  if (projects.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }
  // A real authorization would also check if req.user.id has rights to this project.

  const [result] = await pool.execute(
    `INSERT INTO cookie_services (project_id, category_id, name, description, provider, cookie_names, script_code, privacy_policy_url, retention_period, purpose)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [projectId, category_id, name, description, provider, cookie_names, script_code, privacy_policy_url, retention_period, purpose]
  );

  const insertId = result.insertId;
  const [newCookieService] = await pool.execute('SELECT * FROM cookie_services WHERE id = ?', [insertId]);

  res.status(201).json(newCookieService[0]);
});

const getProjectCookies = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const [cookies] = await pool.execute('SELECT * FROM cookie_services WHERE project_id = ? ORDER BY name', [projectId]);
  res.json(cookies);
});

const updateCookie = catchAsync(async (req, res) => {
  const { cookieId } = req.params;
  const updateData = req.body;

  const fields = Object.keys(updateData);
  const values = Object.values(updateData);
  const setClause = fields.map(field => `${field} = ?`).join(', ');

  const [result] = await pool.execute(`UPDATE cookie_services SET ${setClause} WHERE id = ?`, [...values, cookieId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Cookie service not found' });
  }

  const [updatedCookie] = await pool.execute('SELECT * FROM cookie_services WHERE id = ?', [cookieId]);
  res.json(updatedCookie[0]);
});

const deleteCookie = catchAsync(async (req, res) => {
  const { cookieId } = req.params;
  const [result] = await pool.execute('DELETE FROM cookie_services WHERE id = ?', [cookieId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Cookie service not found' });
  }

  res.status(204).send();
});

module.exports = {
  createCookieService,
  getProjectCookies,
  updateCookie,
  deleteCookie,
};

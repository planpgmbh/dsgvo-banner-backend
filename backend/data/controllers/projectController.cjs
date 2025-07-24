const { pool } = require('../config/database.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const getPublicProjectConfig = catchAsync(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const [projects] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
  if (projects.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const [categories] = await pool.execute('SELECT * FROM cookie_categories WHERE project_id = ? ORDER BY sort_order', [id]);
  const [services] = await pool.execute('SELECT * FROM cookie_services WHERE project_id = ? ORDER BY name', [id]);

  const project = projects[0];
  res.json({
    banner_html: project.custom_html,
    banner_css: project.custom_css,
    project,
    categories,
    services
  });
});

const getAllProjects = catchAsync(async (req, res) => {
  const [projects] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
  res.json(projects);
});

const createProject = catchAsync(async (req, res) => {
  const {
    name, domain, banner_title, banner_text, accept_all_text,
    accept_selection_text, necessary_only_text, language, expiry_months,
    about_cookies_text = '', // Default to empty string
    custom_html = '',      // Default to empty string
    custom_css = '',       // Default to empty string
    custom_js = ''         // Default to empty string
  } = req.body;

  const [result] = await pool.execute(`
    INSERT INTO projects (
      name, domain, banner_title, banner_text, accept_all_text,
      accept_selection_text, necessary_only_text, language, expiry_months,
      about_cookies_text, custom_html, custom_css, custom_js
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, domain, banner_title, banner_text, accept_all_text,
    accept_selection_text, necessary_only_text, language, expiry_months,
    about_cookies_text, custom_html, custom_css, custom_js
  ]);

  res.status(201).json({ id: result.insertId, success: true });
});

const getProjectById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const [projects] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
  if (projects.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const [categories] = await pool.execute('SELECT * FROM cookie_categories WHERE project_id = ? ORDER BY sort_order', [id]);
  const [services] = await pool.execute('SELECT * FROM cookie_services WHERE project_id = ? ORDER BY name', [id]);

  res.json({
    project: projects[0],
    categories,
    services
  });
});

const updateProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const fields = Object.keys(updateData);
  const values = Object.values(updateData);
  const setClause = fields.map(field => `${field} = ?`).join(', ');

  await pool.execute(`UPDATE projects SET ${setClause} WHERE id = ?`, [...values, id]);
  res.json({ success: true });
});

const getProjectConsentLogs = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const [logs] = await pool.execute(
    'SELECT * FROM consent_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [id, parseInt(limit), offset]
  );

  const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM consent_logs WHERE project_id = ?', [id]);

  res.json({
    logs,
    total: countResult[0].total,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

const deleteProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.status(204).send();
});

module.exports = {
  getPublicProjectConfig,
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  getProjectConsentLogs,
  deleteProject
};

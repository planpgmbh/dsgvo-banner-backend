const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createProjectValidationRules = () => {
  return [
    body('name').isString().notEmpty().withMessage('Project name is required'),
    body('domain').isString().notEmpty().withMessage('Domain is required'),
    body('banner_title').optional().isString(),
    body('banner_text').optional().isString(),
    body('accept_all_text').optional().isString(),
    body('accept_selection_text').optional().isString(),
    body('necessary_only_text').optional().isString(),
    body('language').optional().isString().isLength({ max: 10 }),
    body('expiry_months').optional().isInt({ min: 1 }),
    body('about_cookies_text').optional().isString(),
    body('controller_name').optional().isString(),
    body('controller_email').optional().isString(),
    body('controller_address').optional().isString(),
    body('privacy_policy_url').optional().isString(),
    body('custom_html').optional().isString(),
    body('custom_css').optional().isString(),
    body('custom_js').optional().isString(),
  ];
};

const updateProjectValidationRules = () => {
    // For updates, all fields are optional
    return [
        body('name').optional().isString().notEmpty().withMessage('Project name is required'),
        body('domain').optional().isString().notEmpty().withMessage('Domain is required'),
        body('banner_title').optional().isString(),
        body('banner_text').optional().isString(),
        body('accept_all_text').optional().isString(),
        body('accept_selection_text').optional().isString(),
        body('necessary_only_text').optional().isString(),
        body('language').optional().isString().isLength({ max: 10 }),
        body('expiry_months').optional().isInt({ min: 1 }),
        body('about_cookies_text').optional().isString(),
        body('controller_name').optional().isString(),
        body('controller_email').optional().isString(),
        body('controller_address').optional().isString(),
        body('privacy_policy_url').optional().isString(),
        body('custom_html').optional().isString(),
        body('custom_css').optional().isString(),
        body('custom_js').optional().isString(),
      ];
};

module.exports = {
  createProjectValidationRules,
  updateProjectValidationRules,
  validateRequest,
};

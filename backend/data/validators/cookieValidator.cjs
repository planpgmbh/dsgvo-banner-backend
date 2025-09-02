const { body, param, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createCookieServiceValidationRules = () => {
  return [
    param('projectId').isInt({ min: 1 }).withMessage('A valid projectId in the URL is required'),
    body('name').isString().notEmpty().withMessage('Field "name" is required'),
    body('description').optional().isString().withMessage('Field "description" must be a string'),
    body('provider').optional().isString().withMessage('Field "provider" must be a string'),
    body('category_id').isInt({ min: 1 }).withMessage('A valid "category_id" is required'),
    // Optional fields
    body('cookie_names').optional().isString(),
    body('script_code').optional().isString(),
    body('privacy_policy_url')
      .optional({ nullable: true, checkFalsy: true })
      .isURL().withMessage('Must be a valid URL'),
    body('retention_period').optional().isString(),
    body('purpose').optional().isString(),
  ];
};

const updateCookieServiceValidationRules = () => {
    return [
      param('projectId').isInt({ min: 1 }).withMessage('A valid projectId in the URL is required'),
      param('cookieId').isInt({ min: 1 }).withMessage('A valid cookieId in the URL is required'),
      // All body fields are optional for updates
      body('name').optional().isString().notEmpty(),
      body('description').optional().isString().notEmpty(),
      body('provider').optional().isString().notEmpty(),
      body('category_id').optional().isInt({ min: 1 }),
      body('cookie_names').optional().isString(),
      body('script_code').optional().isString(),
      body('privacy_policy_url').optional({ nullable: true, checkFalsy: true }).isURL(),
      body('retention_period').optional().isString(),
      body('purpose').optional().isString(),
    ];
  };

module.exports = {
  createCookieServiceValidationRules,
  updateCookieServiceValidationRules,
  validateRequest,
};

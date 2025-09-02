const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createConsentLogValidationRules = () => {
  return [
    body('project_id').isInt({ min: 1 }).withMessage('A valid project_id is required'),
    body('accepted_services').isArray().withMessage('accepted_services must be an array')
      .custom(arr => arr.every(id => Number.isInteger(id))).withMessage('accepted_services must contain only integers'),
    body('accepted_category_names').optional().isArray().withMessage('accepted_category_names must be an array of strings')
      .custom(arr => arr.every(v => typeof v === 'string')).withMessage('accepted_category_names must contain only strings'),
    body('is_accept_all').isBoolean().withMessage('is_accept_all must be a boolean'),
  ];
};

module.exports = {
  createConsentLogValidationRules,
  validateRequest,
};

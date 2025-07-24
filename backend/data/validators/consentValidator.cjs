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
    body('consents').isObject().notEmpty().withMessage('Consents object is required'),
    body('ip').isIP().withMessage('A valid IP address is required'),
  ];
};

module.exports = {
  createConsentLogValidationRules,
  validateRequest,
};

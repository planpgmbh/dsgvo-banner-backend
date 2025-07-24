const express = require('express');
const { getPublicProjectConfig } = require('../controllers/projectController.cjs');
const { createConsentLog } = require('../controllers/consentController.cjs');
const { createConsentLogValidationRules, validateRequest } = require('../validators/consentValidator.cjs');

const router = express.Router();

router.get('/config', getPublicProjectConfig);
router.post('/consent', createConsentLogValidationRules(), validateRequest, createConsentLog);

module.exports = router;

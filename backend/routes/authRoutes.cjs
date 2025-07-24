const express = require('express');
const { login } = require('../controllers/authController.cjs');
const { loginValidationRules, validateRequest } = require('../validators/authValidator.cjs');

const router = express.Router();

router.post('/login', loginValidationRules(), validateRequest, login);

module.exports = router;

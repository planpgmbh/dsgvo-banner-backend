const express = require('express');
const {
  createCookieService,
  getProjectCookies,
  updateCookie,
  deleteCookie,
} = require('../controllers/cookieController.cjs');
const {
  createCookieServiceValidationRules,
  updateCookieServiceValidationRules,
  validateRequest,
} = require('../validators/cookieValidator.cjs');

// This router needs to be mounted with mergeParams: true to access :projectId from the parent router
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getProjectCookies)
  .post(createCookieServiceValidationRules(), validateRequest, createCookieService);

router
  .route('/:cookieId')
  .put(updateCookieServiceValidationRules(), validateRequest, updateCookie)
  .delete(deleteCookie);

module.exports = router;

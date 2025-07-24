const express = require('express');
const {
  getConsentLogs,
  getProjectAnalytics,
} = require('../controllers/analyticsController.cjs');

// This router needs to be mounted with mergeParams: true to access :projectId from the parent router
const router = express.Router({ mergeParams: true });

router.get('/consent-logs', getConsentLogs);
router.get('/analytics', getProjectAnalytics);

module.exports = router;

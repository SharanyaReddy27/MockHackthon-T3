const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { analyticsFilterValidator } = require('../validators/analyticsValidator');
const validate = require('../middleware/validationMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');

// Analytics endpoints
router.get('/overview', optionalAuth, analyticsFilterValidator, validate, analyticsController.getOverview);
router.get('/referrals', optionalAuth, analyticsFilterValidator, validate, analyticsController.getReferrals);
router.get('/followups', optionalAuth, analyticsFilterValidator, validate, analyticsController.getFollowUps);
router.get('/healthcare-centers', optionalAuth, analyticsFilterValidator, validate, analyticsController.getHealthcareCenters);
router.get('/health-trends', optionalAuth, analyticsFilterValidator, validate, analyticsController.getHealthTrends);

module.exports = router;

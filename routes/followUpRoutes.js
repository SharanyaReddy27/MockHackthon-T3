const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const {
  createFollowUpValidator,
  updateFollowUpStatusValidator,
  getFollowUpByIdValidator,
  upcomingFollowUpValidator,
  listFollowUpsValidator
} = require('../validators/followUpValidator');
const validate = require('../middleware/validationMiddleware');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// Follow-up upcoming must come before /:id
router.get('/upcoming', optionalAuth, upcomingFollowUpValidator, validate, followUpController.getUpcomingFollowUps);

// Standard Follow-up CRUD & status management
router.post('/', authMiddleware, createFollowUpValidator, validate, followUpController.createFollowUp);
router.get('/', optionalAuth, listFollowUpsValidator, validate, followUpController.listFollowUps);
router.get('/:id', optionalAuth, getFollowUpByIdValidator, validate, followUpController.getFollowUpById);
router.put('/:id/status', authMiddleware, updateFollowUpStatusValidator, validate, followUpController.updateFollowUpStatus);

module.exports = router;

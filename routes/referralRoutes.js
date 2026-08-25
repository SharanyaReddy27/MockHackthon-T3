const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const {
  createReferralValidator,
  updateReferralStatusValidator,
  getReferralByIdValidator,
  listReferralsValidator
} = require('../validators/referralValidator');
const validate = require('../middleware/validationMiddleware');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// Referral routes
router.post('/', authMiddleware, createReferralValidator, validate, referralController.createReferral);
router.get('/', optionalAuth, listReferralsValidator, validate, referralController.listReferrals);
router.get('/:id', optionalAuth, getReferralByIdValidator, validate, referralController.getReferralById);
router.put('/:id/status', authMiddleware, updateReferralStatusValidator, validate, referralController.updateReferralStatus);

module.exports = router;

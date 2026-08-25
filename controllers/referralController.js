const referralService = require('../services/referralService');

/**
 * Referral Controller
 */
class ReferralController {
  async createReferral(req, res, next) {
    try {
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const referral = await referralService.createReferral(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Referral created successfully',
        data: {
          referralId: referral._id,
          id: referral._id,
          status: referral.status
        }
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async getReferralById(req, res, next) {
    try {
      const referral = await referralService.getReferralById(req.params.id);
      res.status(200).json({
        success: true,
        data: referral
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async updateReferralStatus(req, res, next) {
    try {
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const updated = await referralService.updateReferralStatus(req.params.id, req.body.status, userId);
      res.status(200).json({
        success: true,
        message: `Referral status updated to ${req.body.status} successfully`,
        data: updated
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async listReferrals(req, res, next) {
    try {
      const result = await referralService.listReferrals(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientReferrals(req, res, next) {
    try {
      const result = await referralService.getPatientReferrals(req.params.patientId, req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReferralController();

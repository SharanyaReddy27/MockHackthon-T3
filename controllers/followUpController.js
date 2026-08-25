const followUpService = require('../services/followUpService');

/**
 * Follow-up Controller
 */
class FollowUpController {
  async createFollowUp(req, res, next) {
    try {
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const followUp = await followUpService.createFollowUp(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Follow-up created successfully',
        data: followUp
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

  async getFollowUpById(req, res, next) {
    try {
      const followUp = await followUpService.getFollowUpById(req.params.id);
      res.status(200).json({
        success: true,
        data: followUp
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

  async getUpcomingFollowUps(req, res, next) {
    try {
      const upcoming = await followUpService.getUpcomingFollowUps(req.query);
      res.status(200).json({
        success: true,
        count: upcoming.length,
        data: upcoming
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFollowUpStatus(req, res, next) {
    try {
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const updated = await followUpService.updateFollowUpStatus(req.params.id, req.body.status, userId);
      res.status(200).json({
        success: true,
        message: `Follow-up status updated to ${req.body.status} successfully`,
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

  async listFollowUps(req, res, next) {
    try {
      const result = await followUpService.listFollowUps(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FollowUpController();

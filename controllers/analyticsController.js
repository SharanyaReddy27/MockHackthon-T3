const analyticsService = require('../services/analyticsService');

/**
 * Analytics Controller
 */
class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const data = await analyticsService.getOverviewAnalytics(req.query);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferrals(req, res, next) {
    try {
      const data = await analyticsService.getReferralAnalytics(req.query);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowUps(req, res, next) {
    try {
      const data = await analyticsService.getFollowUpAnalytics(req.query);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async getHealthcareCenters(req, res, next) {
    try {
      const result = await analyticsService.getHealthcareCenterAnalytics(req.query);
      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  async getHealthTrends(req, res, next) {
    try {
      const data = await analyticsService.getHealthTrendsAnalytics(req.query);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();

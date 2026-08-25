const healthcareCenterService = require('../services/healthcareCenterService');

/**
 * Healthcare Center Controller
 */
class HealthcareCenterController {
  async createHealthcareCenter(req, res, next) {
    try {
      const center = await healthcareCenterService.createHealthcareCenter(req.body);
      res.status(201).json({
        success: true,
        message: 'Healthcare center created successfully',
        data: center
      });
    } catch (error) {
      next(error);
    }
  }

  async getHealthcareCenters(req, res, next) {
    try {
      const centers = await healthcareCenterService.listHealthcareCenters(req.query);
      res.status(200).json({
        success: true,
        count: centers.length,
        data: centers
      });
    } catch (error) {
      next(error);
    }
  }

  async getHealthcareCenterById(req, res, next) {
    try {
      const center = await healthcareCenterService.getHealthcareCenterById(req.params.id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'Healthcare center not found'
        });
      }
      res.status(200).json({
        success: true,
        data: center
      });
    } catch (error) {
      next(error);
    }
  }

  async findNearbyCenters(req, res, next) {
    try {
      const centers = await healthcareCenterService.findNearbyCenters(req.query);
      res.status(200).json({
        success: true,
        count: centers.length,
        data: centers
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHealthcareCenter(req, res, next) {
    try {
      const updated = await healthcareCenterService.updateHealthcareCenter(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Healthcare center not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Healthcare center updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthcareCenterController();

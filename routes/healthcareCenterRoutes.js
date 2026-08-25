const express = require('express');
const router = express.Router();
const healthcareCenterController = require('../controllers/healthcareCenterController');
const {
  createHealthcareCenterValidator,
  updateHealthcareCenterValidator,
  nearbySearchValidator,
  getByIdValidator,
  listHealthcareCentersValidator
} = require('../validators/healthcareCenterValidator');
const validate = require('../middleware/validationMiddleware');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// Discovery endpoints (GET /nearby must come before /:id)
router.get('/nearby', nearbySearchValidator, validate, healthcareCenterController.findNearbyCenters);

// Center listings and CRUD
router.get('/', listHealthcareCentersValidator, validate, healthcareCenterController.getHealthcareCenters);
router.get('/:id', getByIdValidator, validate, healthcareCenterController.getHealthcareCenterById);
router.post('/', optionalAuth, createHealthcareCenterValidator, validate, healthcareCenterController.createHealthcareCenter);
router.put('/:id', optionalAuth, updateHealthcareCenterValidator, validate, healthcareCenterController.updateHealthcareCenter);

module.exports = router;

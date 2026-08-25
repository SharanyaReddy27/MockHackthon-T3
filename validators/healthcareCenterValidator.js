const { body, query, param } = require('express-validator');
const { ALLOWED_HEALTHCARE_TYPES } = require('../constants/healthcareTypes');

const createHealthcareCenterValidator = [
  body('name').trim().notEmpty().withMessage('Healthcare center name is required'),
  body('type')
    .trim()
    .isIn(ALLOWED_HEALTHCARE_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_HEALTHCARE_TYPES.join(', ')}`),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('village').optional().trim(),
  body('district').optional().trim(),
  body('state').optional().trim(),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  body('phone').optional().trim(),
  body('services').optional().isArray().withMessage('Services must be an array of strings'),
  body('emergencySupport').optional().isBoolean().withMessage('Emergency support must be a boolean'),
  body('operatingHours').optional().isObject().withMessage('Operating hours must be an object'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const updateHealthcareCenterValidator = [
  param('id').isMongoId().withMessage('Invalid healthcare center ID format'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('type')
    .optional()
    .trim()
    .isIn(ALLOWED_HEALTHCARE_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_HEALTHCARE_TYPES.join(', ')}`),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('emergencySupport').optional().isBoolean().withMessage('Emergency support must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const nearbySearchValidator = [
  query('latitude')
    .exists({ checkFalsy: true })
    .withMessage('Latitude is required')
    .bail()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  query('longitude')
    .exists({ checkFalsy: true })
    .withMessage('Longitude is required')
    .bail()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Radius must be a positive number in kilometers'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('emergencySupport')
    .optional()
    .isBoolean()
    .withMessage('emergencySupport must be boolean (true/false)'),
  query('type')
    .optional()
    .isIn(ALLOWED_HEALTHCARE_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_HEALTHCARE_TYPES.join(', ')}`),
  query('service').optional().trim()
];

const getByIdValidator = [
  param('id').isMongoId().withMessage('Invalid healthcare center ID format')
];

const listHealthcareCentersValidator = [
  query('type').optional().isIn(ALLOWED_HEALTHCARE_TYPES).withMessage('Invalid type filter'),
  query('emergencySupport').optional().isBoolean().withMessage('emergencySupport must be boolean'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  query('village').optional().trim(),
  query('district').optional().trim(),
  query('service').optional().trim()
];

module.exports = {
  createHealthcareCenterValidator,
  updateHealthcareCenterValidator,
  nearbySearchValidator,
  getByIdValidator,
  listHealthcareCentersValidator
};

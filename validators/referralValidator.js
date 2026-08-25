const { body, query, param } = require('express-validator');
const { ALLOWED_PRIORITIES, ALLOWED_STATUSES } = require('../constants/referralEnums');

const createReferralValidator = [
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('healthcareCenterId').isMongoId().withMessage('Valid healthcareCenterId is required'),
  body('consultationId').optional().isMongoId().withMessage('consultationId must be a valid ID'),
  body('priority')
    .trim()
    .isIn(ALLOWED_PRIORITIES)
    .withMessage(`Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}`),
  body('reason').trim().notEmpty().withMessage('Referral reason is required'),
  body('clinicalSummary').optional().trim(),
  body('notes').optional().trim()
];

const updateReferralStatusValidator = [
  param('id').isMongoId().withMessage('Invalid referral ID format'),
  body('status')
    .trim()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`)
];

const getReferralByIdValidator = [
  param('id').isMongoId().withMessage('Invalid referral ID format')
];

const getPatientReferralsValidator = [
  param('patientId').isMongoId().withMessage('Invalid patient ID format'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const listReferralsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(ALLOWED_STATUSES).withMessage('Invalid status filter'),
  query('priority').optional().isIn(ALLOWED_PRIORITIES).withMessage('Invalid priority filter'),
  query('healthcareCenterId').optional().isMongoId().withMessage('Invalid healthcareCenterId filter'),
  query('from').optional().isISO8601().withMessage('From date must be a valid ISO 8601 date'),
  query('to').optional().isISO8601().withMessage('To date must be a valid ISO 8601 date')
];

module.exports = {
  createReferralValidator,
  updateReferralStatusValidator,
  getReferralByIdValidator,
  getPatientReferralsValidator,
  listReferralsValidator
};

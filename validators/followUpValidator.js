const { body, query, param } = require('express-validator');
const { ALLOWED_FOLLOWUP_TYPES, ALLOWED_PERSISTED_FOLLOWUP_STATUSES } = require('../constants/followUpEnums');

const createFollowUpValidator = [
  body('patientId').isMongoId().withMessage('Valid patientId is required'),
  body('referralId').optional().isMongoId().withMessage('referralId must be a valid ID'),
  body('consultationId').optional().isMongoId().withMessage('consultationId must be a valid ID'),
  body('type')
    .trim()
    .isIn(ALLOWED_FOLLOWUP_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_FOLLOWUP_TYPES.join(', ')}`),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date (e.g. 2026-09-01T10:00:00Z)'),
  body('notes').optional().trim()
];

const updateFollowUpStatusValidator = [
  param('id').isMongoId().withMessage('Invalid follow-up ID format'),
  body('status')
    .trim()
    .isIn(ALLOWED_PERSISTED_FOLLOWUP_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_PERSISTED_FOLLOWUP_STATUSES.join(', ')}`)
];

const getFollowUpByIdValidator = [
  param('id').isMongoId().withMessage('Invalid follow-up ID format')
];

const upcomingFollowUpValidator = [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be an integer between 1 and 365'),
  query('village').optional().trim()
];

const listFollowUpsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('patientId').optional().isMongoId().withMessage('Invalid patientId filter'),
  query('status').optional().isString().withMessage('Invalid status filter'),
  query('type').optional().isIn(ALLOWED_FOLLOWUP_TYPES).withMessage('Invalid type filter'),
  query('from').optional().isISO8601().withMessage('From date must be a valid ISO 8601 date'),
  query('to').optional().isISO8601().withMessage('To date must be a valid ISO 8601 date')
];

module.exports = {
  createFollowUpValidator,
  updateFollowUpStatusValidator,
  getFollowUpByIdValidator,
  upcomingFollowUpValidator,
  listFollowUpsValidator
};

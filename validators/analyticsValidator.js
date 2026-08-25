const { query } = require('express-validator');

const analyticsFilterValidator = [
  query('village').optional().trim(),
  query('district').optional().trim(),
  query('from').optional().isISO8601().withMessage('from date must be a valid ISO 8601 date format'),
  query('to').optional().isISO8601().withMessage('to date must be a valid ISO 8601 date format')
];

module.exports = {
  analyticsFilterValidator
};

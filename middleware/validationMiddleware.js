const { validationResult } = require('express-validator');

/**
 * Validation Middleware
 * Checks express-validator results and returns structured error payload if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0].message || 'Validation error',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = validate;

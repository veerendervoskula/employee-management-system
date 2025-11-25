const { ValidationError } = require("./errorHandler");

/**
 * Creates a validation middleware for the given schema
 * 
 * @param {Object} schema - The Joi schema to validate against
 * @param {String} property - The request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {

        // Check if body is empty when validating 'body'
        if (property === 'body') {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ message: 'Request body cannot be empty' });
            }
        }

        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown properties
            errors: {
                wrap: {
                    label: false // Don't wrap error labels
                }
            }
        });
        // Replace request property with validated value
        if (!error) {
            req[property] = value;
            return next();
        }
        if (error) {
            // Pass ValidationError to global error handler
            return next(new ValidationError("Validation failed",
                error.details.map(detail => ({
                    field: detail.context.label || detail.context.key,
                    message: detail.message
                }))))
        }
    }
}
/**
 * Helper to transform Joi validation error into a simple field->message map
 * This produces the same shape the frontend Form.validate expects.
 */
function formatJoiErrors(error) {
  if (!error || !error.details) return null;
  const errors = {};

  const templates = {
    'string.base': (label) => `${label} must be a string`,
    'string.empty': (label) => `${label} is required`,
    'string.min': (label, ctx) => `${label} must be at least ${ctx.limit} characters`,
    'string.max': (label, ctx) => `${label} must be at most ${ctx.limit} characters`,
    'any.required': (label) => `${label} is required`,
    'boolean.base': (label) => `${label} must be true or false`
  };

  for (const item of error.details) {
    const key = item.path && item.path[0] ? item.path[0] : '_';
    const type = item.type || '';
    const ctx = item.context || {};
    const label = ctx.label || ctx.key || key;

    if (templates[type]) {
      try {
        errors[key] = templates[type](label, ctx);
      } catch (e) {
        errors[key] = item.message || `${label} is invalid`;
      }
    } else {
      // Fallback to Joi message if template not defined
      errors[key] = item.message || `${label} is invalid`;
    }
  }
  return errors;
}

module.exports = {
    validateRequest,
    formatJoiErrors
};

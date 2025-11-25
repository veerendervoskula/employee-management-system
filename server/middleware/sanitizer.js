const validator = require('validator');

/**
 * Recursively sanitize all string properties in an object/array using validator.escape
 * This is a defensive measure to reduce risk of stored XSS. Use in addition to proper
 * output encoding on the client.
 */
function sanitizeObject(input) {
  if (input === null || input === undefined) return input;

  if (Array.isArray(input)) {
    return input.map(sanitizeObject);
  }

  if (typeof input === 'object') {
    const out = {};
    for (const key of Object.keys(input)) {
      out[key] = sanitizeObject(input[key]);
    }
    return out;
  }

  if (typeof input === 'string') {
    // validator.escape will replace <, >, &, ") with escaped equivalents
    return validator.escape(input);
  }

  return input;
}

module.exports = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
  } catch (e) {
    // If sanitization fails, log and continue; do not block the request.
    // Keep middleware lightweight and safe.
    // eslint-disable-next-line no-console
    console.error('Sanitizer middleware error:', e);
  }
  next();
};

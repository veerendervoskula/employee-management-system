const logger = require("./logger");

/**
 * Wraps an async route handler to catch errors and pass them to Express error middleware.
 * @param {Function} fn - The async function to wrap (req, res, next).
 * @returns {Function} Express middleware function.
 */
exports.callAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Sends a standardized JSON error response.
 * @param {Object} res - Express response object.
 * @param {number} [status=500] - HTTP status code.
 * @param {string} [message="Internal Server Error"] - Error message.
 * @param {Object} [details] - Additional error details.
 * @param {Object} [headers] - Optional headers to set.
 */
exports.sendError = (res, status = 500, message = "Internal Server Error", details = null, headers = {}) => {
  
  logger.error(message, {
    status,
    details: details || "No additional details",
    timestamp: new Date().toISOString()
  });

  if (headers && typeof headers === "object") {
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  }

  const payload = { error: message };
  if (details) payload.details = details;

  return res.status(status).json(payload);
};

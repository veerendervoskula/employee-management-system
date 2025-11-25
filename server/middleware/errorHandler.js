/**
 * Global error handler middleware with comprehensive error handling
 * @module middleware/errorHandler
 */
const logger = require('../logger');

/**
 * Custom error class for API errors with status codes and operational flags
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error for missing resources
 * @class NotFoundError
 * @extends ApiError
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

/**
 * Validation Error for invalid inputs
 * @class ValidationError
 * @extends ApiError
 */
class ValidationError extends ApiError {
  constructor(message = 'Invalid input', details = null) {
    super(400, message, details);
  }
}

/**
 * Global error handler middleware
 * Handles different types of errors and formats responses consistently
 */
const errorHandler = (err, req, res, next) => {
  // Normalize error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error with context
  logger.error(`${err.statusCode} - ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
    details: err.details || undefined,
    requestId: req.id // Assuming request ID middleware
  });

  // Send formatted error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    details: err.details,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  ApiError,
  errorHandler,
  NotFoundError,
  ValidationError
};
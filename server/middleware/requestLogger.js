const morgan = require('morgan');
const logger = require('../logger');

// Create a write stream for morgan that writes to winston
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Custom morgan format with method, url, status, and response time
const morganFormat = ':method :url :status :response-time[0]ms';

module.exports = morgan(morganFormat, { stream });
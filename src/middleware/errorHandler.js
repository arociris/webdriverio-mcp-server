import { logger } from '../utils/logger.js';

const errorLogger = logger.child({ context: 'ErrorHandler' });

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error
  errorLogger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    sessionId: req.params.sessionId,
  }, 'Unhandled error occurred');

  // Determine error type and status code
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetails = err.message;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.message.includes('timeout')) {
    statusCode = 408;
    message = 'Request timeout';
  } else if (err.message.includes('Element with id')) {
    statusCode = 400;
    message = 'Failed to execute action';
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    errorDetails,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 handler for unmatched routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  errorLogger.warn({
    url: req.url,
    method: req.method,
  }, 'Route not found');

  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    errorDetails: `No route found for ${req.method} ${req.url}`,
    timestamp: new Date().toISOString(),
  });
}; 
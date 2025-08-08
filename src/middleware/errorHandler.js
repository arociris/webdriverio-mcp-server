import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

const errorLogger = logger.child({ context: 'ErrorHandler' });

export const errorHandler = (err, req, res, next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.status : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const suggestion = isAppError ? err.suggestion : 'Please try again later or contact support with the error code.';
  const details = isAppError ? err.details : undefined;

  errorLogger.error({
    error: err.message,
    code,
    stack: err.stack,
    url: req.url,
    method: req.method,
  }, 'Unhandled error occurred');

  res.status(statusCode).json({
    status: 'error',
    code,
    message: err.message || 'Internal server error',
    suggestion,
    details,
    timestamp: new Date().toISOString(),
  });
};

export const notFoundHandler = (req, res) => {
  errorLogger.warn({ url: req.url, method: req.method }, 'Route not found');
  res.status(404).json({
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: 'Route not found',
    errorDetails: `No route found for ${req.method} ${req.url}`,
    timestamp: new Date().toISOString(),
  });
}; 
// Unified error handling middleware
// Ensures consistent response format: { "message": "..." }

function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
}

function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`, err.stack);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};


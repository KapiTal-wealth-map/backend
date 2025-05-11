// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('🔴 Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};
  
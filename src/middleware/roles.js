// middlewares/roles.js
const AppError = require('../utils/AppError');

const roles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied: insufficient permissions', 403));
    }
    next();
  };
}

module.exports = roles;
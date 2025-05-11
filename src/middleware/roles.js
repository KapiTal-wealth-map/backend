// middlewares/roles.js
const AppError = require('../utils/AppError');

const roles = (allowedRoles) => {
  return (req, res, next) => {
    console.log('req.user', req.user);
    console.log('allowedRoles', allowedRoles);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied: insufficient permissions', 403));
    }
    next();
  };
}

module.exports = roles;
const activityService = require('../services/activity.services');

const activityLogger = (actionType, description) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function (data) {
      res.send = originalSend;
      const result = res.send.call(this, data);
      
      // Only log if the request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        if (userId) {
          activityService.createActivityLog(
            userId,
            actionType,
            description,
            req.ip,
            req.headers['user-agent']
          ).catch(error => {
            console.error('Error logging activity:', error);
          });
        }
      }
      
      return result;
    };
    
    next();
  };
};

module.exports = activityLogger; 
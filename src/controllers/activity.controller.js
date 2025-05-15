const activityService = require('../services/activity.services');

exports.getActivityLogs = async (req, res, next) => {
  try {
    const { actionType, from, to, limit } = req.query;
    const companyId = req.user.companyId;

    const logs = await activityService.getActivityLogs(companyId, {
      actionType,
      from,
      to,
      limit
    });

    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
}; 
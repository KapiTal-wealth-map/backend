const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const createActivityLog = async (userId, actionType, description, ipAddress, userAgent) => {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId,
        actionType,
        description,
        ipAddress,
        userAgent
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    return log;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw new AppError('Failed to create activity log', 500);
  }
};

const getActivityLogs = async (companyId, filters = {}) => {
  try {
    const { actionType, from, to, limit } = filters;
    
    const where = {
      user: {
        companyId: companyId
      }
    };

    if (actionType && actionType !== 'all') {
      where.actionType = actionType;
    }

    if (from || to) {
      where.timestamp = {};
      if (from) {
        where.timestamp.gte = new Date(from);
      }
      if (to) {
        where.timestamp.lte = new Date(to);
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    return logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.user.name,
      userEmail: log.user.email,
      actionType: log.actionType,
      description: log.description,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.timestamp
    }));
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw new AppError('Failed to fetch activity logs', 500);
  }
};

module.exports = {
  createActivityLog,
  getActivityLogs
}; 
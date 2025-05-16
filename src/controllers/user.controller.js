const userService = require('../services/user.services');
const activityService = require('../services/activity.services');

exports.inviteUser = async (req, res, next) => {
  try {
    const adminUser = req.user; // Assumes auth middleware added req.user
    const { email, role } = req.body;

    const result = await userService.generateInvite( email, role, adminUser );
    
    // Log the invitation
    await activityService.createActivityLog(
      adminUser.id,
      'create',
      `User ${email} invited with role ${role}`,
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.acceptInvite = async (req, res, next) => {
  try {
    const { token, name, password } = req.body;
    const result = await userService.acceptInvite(token, name, password);
    
    // Return in the same format as login response
    res.status(200).json(result);
  } catch (err) {
    next(err);
  } 
};

exports.getProfile = async (req, res, next) => {
    try {
        
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};
  
exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.listCompanyUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsersInCompany(req.user.companyId);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const adminUser = req.user;
    
    // Get user details before deactivation
    const userToDeactivate = await userService.getUserProfile(userId);
    
    await userService.deactivateUser(userId, adminUser.companyId);
    
    // Log the deactivation
    await activityService.createActivityLog(
      adminUser.id,
      'delete',
      `User ${userToDeactivate.email} deactivated`,
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { role } = req.body;
    const adminUser = req.user;
    
    // Get user details before role update
    const userToUpdate = await userService.getUserProfile(userId);
    
    await userService.updateUserRole(userId, role, adminUser.companyId);
    
    // Log the role update
    await activityService.createActivityLog(
      adminUser.id,
      'update',
      `User ${userToUpdate.email} role updated to ${role}`,
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(200).json({ success: true, message: 'User role updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getCompanySettings = async (req, res, next) => {
  try {
    // Get company settings using company ID from authenticated user
    const companyId = req.user.companyId;
    const company = await userService.getCompanySettings(companyId);
    res.status(200).json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

exports.updateCompanySettings = async (req, res, next) => {
  try {
    // Ensure user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update company settings' });
    }
    
    const companyId = req.user.companyId;
    const { name, logoUrl, dataAccessSettings } = req.body;
    
    const result = await userService.updateCompanySettings(
      companyId, 
      { 
        name, 
        logo: logoUrl, // Store the Supabase URL
        dataAccessSettings 
      }
    );
    
    res.status(200).json({ success: true, company: result });
  } catch (err) {
    next(err);
  }
};

exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await userService.getUserNotificationPreferences(userId);
    res.json({ notificationPreferences: preferences });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: 'Notification preferences are required' });
    }

    const updatedPreferences = await userService.updateUserNotificationPreferences(userId, preferences);
    res.json({ notificationPreferences: updatedPreferences });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
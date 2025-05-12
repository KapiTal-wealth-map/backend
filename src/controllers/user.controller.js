const userService = require('../services/user.services');

exports.inviteUser = async (req, res, next) => {
  try {
    const adminUser = req.user; // Assumes auth middleware added req.user
    const { email, role } = req.body;

    const result = await userService.generateInvite( email, role, adminUser );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.acceptInvite = async (req, res, next) => {
  try {
    const { token, name, password } = req.body;
    const result = await userService.acceptInvite(token, name, password);
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
    await userService.deactivateUser(userId, req.user.companyId);
    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { role } = req.body;
    
    // Validate that the role is either 'admin' or 'user'
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Invalid role. Role must be either "admin" or "user"' });
    }
    
    // Ensure users can't update their own role
    if (userId === req.user.id) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }
    
    await userService.updateUserRole(userId, role, req.user.companyId);
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
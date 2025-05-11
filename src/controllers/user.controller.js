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
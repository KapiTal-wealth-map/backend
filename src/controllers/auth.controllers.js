const authService = require('../services/auth.services');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const activityService = require('../services/activity.services');

exports.register = async (req, res, next) => {
  try {
    const { companyName, email, password, name, logoUrl } = req.body;
    
    // Pass the logo URL instead of a file path
    const result = await authService.registerCompany(companyName, email, password, name, logoUrl);
    
    // Log the registration
    await activityService.createActivityLog(
      result.user.id,
      'create',
      `Company "${companyName}" registered with admin user ${email}`,
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.setupMfa = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const {user, decoded} = await authService.verifyJWT(token);
    const result = await authService.setupMfa(user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.verifyMfa = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyMfaCode(email, code);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    if (!result.requireMFA) {
      // Log successful login
      await activityService.createActivityLog(
        result.user.id,
        'login',
        `User ${email} logged in successfully`,
        req.ip,
        req.headers['user-agent']
      );
    }
    
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.sendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.sendEmailOtp(email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmailOtp(email, otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Log the logout
    await activityService.createActivityLog(
      req.user.id,
      'logout',
      `User ${req.user.email} logged out`,
      req.ip,
      req.headers['user-agent']
    );
    
  res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

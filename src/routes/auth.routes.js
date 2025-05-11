const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');
const verifyJWT = require('../middleware/auth');

// Auth routes
router.post('/login', authController.login);
router.post('/verify-mfa', authController.verifyMfa);
router.post('/register', authController.register);
router.get('/setup-mfa', verifyJWT, authController.setupMfa);
router.post('/send-email-otp', authController.sendEmailOtp);
router.post('/verify-email-otp', authController.verifyEmailOtp);
router.post('/logout', authController.logout);

module.exports = router;

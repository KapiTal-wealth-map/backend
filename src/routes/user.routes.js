const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const activityController = require('../controllers/activity.controller');
const verifyJWT = require('../middleware/auth'); // assuming JWT middleware
const roles = require('../middleware/roles');

router.post('/accept-invite', userController.acceptInvite);
router.get('/me', verifyJWT, userController.getProfile);
router.patch('/me', verifyJWT, userController.updateProfile);

// Company settings routes
router.get('/company-settings', verifyJWT, userController.getCompanySettings);
router.get('/', verifyJWT, userController.listCompanyUsers);

// Admin-only actions
router.put('/company-settings', verifyJWT, roles(['admin']), userController.updateCompanySettings);
router.post('/invite', verifyJWT, roles(['admin']), userController.inviteUser);
router.patch('/:userId', verifyJWT, roles(['admin']), userController.deactivateUser);
router.put('/:userId/role', verifyJWT, roles(['admin']), userController.updateUserRole);

// Activity logs route
router.get('/activity-logs', verifyJWT, roles(['admin']), activityController.getActivityLogs);

// Notification preferences routes
router.get('/notification-preferences', verifyJWT, userController.getNotificationPreferences);
router.put('/notification-preferences', verifyJWT, userController.updateNotificationPreferences);

module.exports = router;

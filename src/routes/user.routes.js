const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyJWT = require('../middleware/auth'); // assuming JWT middleware
const roles = require('../middleware/roles');

router.post('/accept-invite', userController.acceptInvite);
router.get('/me', verifyJWT, userController.getProfile);
router.patch('/me', verifyJWT, userController.updateProfile);

// Company settings routes
router.get('/company-settings', verifyJWT, userController.getCompanySettings);
router.put('/company-settings', verifyJWT, roles(['admin']), userController.updateCompanySettings);

// Admin-only actions
router.post('/invite', verifyJWT, roles(['admin']), userController.inviteUser);
router.get('/', verifyJWT, userController.listCompanyUsers);
router.patch('/:userId', verifyJWT, roles(['admin']), userController.deactivateUser);
router.put('/:userId/role', verifyJWT, roles(['admin']), userController.updateUserRole);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyJWT = require('../middleware/auth'); // assuming JWT middleware
const roles = require('../middleware/roles');

router.post('/accept-invite', userController.acceptInvite);
router.get('/me', verifyJWT, userController.getProfile);
router.patch('/me', verifyJWT, userController.updateProfile);

// Admin-only actions
router.post('/invite', verifyJWT, roles(['admin']), userController.inviteUser);
router.get('/', verifyJWT, roles(['admin']), userController.listCompanyUsers);
router.patch('/:userId', verifyJWT, roles(['admin']), userController.deactivateUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, handleValidationErrors } = require('../middleware/validation');

router.post('/register', validateRegister, handleValidationErrors, AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/regenerate-api-key', authenticateToken, AuthController.regenerateApiKey);

module.exports = router;
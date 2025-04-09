// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { userValidationRules, handleValidationErrors } = require('../middleware/validators');

// Register a new user
router.post('/register', userValidationRules, handleValidationErrors, register);

// Login user
router.post('/login', login);

// Get current user info
router.get('/me', authenticateToken, me);

module.exports = router;
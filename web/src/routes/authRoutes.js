const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateJwt } = require('../config/passport');

const router = express.Router();


// @route POST /api/auth/register
// @desc Register a new user
// @access Public

router.post(
    '/register', [
        body('email').isEmail().withMessage('Please enter a valid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('first_name').notEmpty().withMessage('First name is required'),
        body('last_name').notEmpty().withMessage('Last name is required'),
        body('role').isIn(['nurse', 'admin']).withMessage('Role must be either nurse or admin'),
        body('phone_number').optional().isMobilePhone().withMessage('Please provide a valid phone number')
],
    authController.register
);

// @route POST /api/auth/login
// @desc Login a user
// @access Public
router.post('/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    authController.login
);


// @route GET /api/auth/profile
// @desc Get user profile
// @access Private
router.get('/profile', authenticateJwt, authController.getCurrentUser);

module.exports = router;
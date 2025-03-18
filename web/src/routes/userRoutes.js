const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateJwt } = require('../config/passport');

const router = express.Router();

// Create a new user
router.post(
    '/',
    authenticateJwt,
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('first_name').notEmpty().withMessage('First name is required'),
        body('last_name').notEmpty().withMessage('Last name is required'),
        body('role').isIn(['admin', 'nurse', 'facility']).withMessage('Invalid role'),
        body('phone_number').optional().isString().withMessage('Phone number must be a string')
    ],
    userController.createUser
);

// Get all users
router.get('/', authenticateJwt, userController.getAllUsers);

// Get a specific user by ID
router.get('/:id', authenticateJwt, userController.getUserById);

// Update a user
router.put(
    '/:id',
    authenticateJwt,
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('first_name').notEmpty().withMessage('First name is required'),
        body('last_name').notEmpty().withMessage('Last name is required'),
        body('role').isIn(['admin', 'nurse', 'facility']).withMessage('Invalid role'),
        body('phone_number').optional().isString().withMessage('Phone number must be a string')
    ],
    userController.updateUser
);

// Delete a user
router.delete('/:id', authenticateJwt, userController.deleteUser);

module.exports = router;
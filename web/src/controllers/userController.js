const { User, NurseProfile } = require('../models');
const { validationResult } = require('express-validator');

// Create a new user via @route POST /api/users
exports.createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { email, password, first_name, last_name, role, phone_number } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = await User.create({
            email,
            password_hash: password, // Ensure password is hashed in the model
            first_name,
            last_name,
            role,
            phone_number,
        });

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });

    } catch (error) {
        next(error);
    }
};

// Get all users via @route GET /api/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: [{ model: NurseProfile, as: 'nurseProfile', required: false }]
        });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// Get a specific user via @route GET /api/users/:id
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: NurseProfile, as: 'nurseProfile', required: false }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};

// Update a user via @route PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { email, first_name, last_name, role, phone_number } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.email = email;
        user.first_name = first_name;
        user.last_name = last_name;
        user.role = role;
        user.phone_number = phone_number;

        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        next(error);
    }
};

// Delete a user via @route DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();

        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        next(error);
    }
};
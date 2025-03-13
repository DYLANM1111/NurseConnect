const jwt = require('jsonwebtoken');
const { User, NurseProfile } = require('../models');
const { validationResult } = require('express-validator');


// registering a new user via @route POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        //for user
        const { email, password, first_name, last_name, role } = req.body;

        //checking if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        //if no errors, create new user
        const newUser = await User.create({
            email,
            password_hash: password,
            first_name: firstName,
            last_name: lastName,
            role,
            phone_number: phoneNumber,
        });

        //for when role is of the user is nurse
        if (role == 'nurse') {
            await NurseProfile.create({
                user_id: user.id,
                specialty: req.body.specialty || null,
                years_experience: req.body.years_experience || null,
                preferred_shift_type: req.body.preferred_shift_type || [],
                preferred_distance: req.body.preferred_distance || 25,
                min_hourly_rate: req.body.min_hourly_rate || null,
                max_hourly_rate: req.body.max_hourly_rate || null,
            });
        }


        //generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password_hash, ...userWithoutPassword } = user.toJSON();

        res.status(201).jason({
            message: 'User registered successfully',
            user: userWithoutPassword,
            token,
        });

    } catch (error) {
        next(error);
    }
};


// login user via @route POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        //look up user
        const user = await User.findOne({
            where: { email },
            include: [{ model: NurseProfile, as: 'nurseProfile', required: false }]
        });

        //checking if user exists
        if (!user) {
            return res.status(401).json({ message: 'User credentials entered not found' });
        }

        //checking if password is correct
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        //generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role},
        process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password_hash, ...userWithoutPassword } = user.toJSON();

        res.status(200).json({
            message: 'User logged in successfully',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        next(error);
     }
};


//retrieving the user profile via @route GET /api/auth/profile
exports.getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include : [
                { model: NuurseProfile, as: 'nurseProfile', required: false }
            ],
            attributes: { exclude: ['password_hash'] 

            }});
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        next(error);
    }
};

const { NurseProfile, User, License, Certification } = require('../models');
const { validationResult } = require('express-validator');

// Create a new nurse profile via @route POST /api/nurses
exports.createNurseProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { user_id, specialty, years_experience, preferred_shift_type, preferred_distance, min_hourly_rate, max_hourly_rate } = req.body;

        const newNurseProfile = await NurseProfile.create({
            user_id,
            specialty,
            years_experience,
            preferred_shift_type,
            preferred_distance,
            min_hourly_rate,
            max_hourly_rate
        });

        res.status(201).json({
            message: 'Nurse profile created successfully',
            nurseProfile: newNurseProfile
        });

    } catch (error) {
        next(error);
    }
};

// Get all nurse profiles via @route GET /api/nurses
exports.getAllNurseProfiles = async (req, res, next) => {
    try {
        const nurseProfiles = await NurseProfile.findAll({
            include: [
                { model: User, as: 'user' },
                { model: License, as: 'licenses' },
                { model: Certification, as: 'certifications' }
            ]
        });
        res.status(200).json(nurseProfiles);
    } catch (error) {
        next(error);
    }
};

// Get a specific nurse profile via @route GET /api/nurses/:id
exports.getNurseProfileById = async (req, res, next) => {
    try {
        const nurseProfile = await NurseProfile.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user' },
                { model: License, as: 'licenses' },
                { model: Certification, as: 'certifications' }
            ]
        });

        if (!nurseProfile) {
            return res.status(404).json({ message: 'Nurse profile not found' });
        }

        res.status(200).json(nurseProfile);

    } catch (error) {
        next(error);
    }
};

// Update a nurse profile via @route PUT /api/nurses/:id
exports.updateNurseProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { specialty, years_experience, preferred_shift_type, preferred_distance, min_hourly_rate, max_hourly_rate } = req.body;

        const nurseProfile = await NurseProfile.findByPk(req.params.id);
        if (!nurseProfile) {
            return res.status(404).json({ message: 'Nurse profile not found' });
        }

        nurseProfile.specialty = specialty;
        nurseProfile.years_experience = years_experience;
        nurseProfile.preferred_shift_type = preferred_shift_type;
        nurseProfile.preferred_distance = preferred_distance;
        nurseProfile.min_hourly_rate = min_hourly_rate;
        nurseProfile.max_hourly_rate = max_hourly_rate;

        await nurseProfile.save();

        res.status(200).json({
            message: 'Nurse profile updated successfully',
            nurseProfile
        });

    } catch (error) {
        next(error);
    }
};

// Delete a nurse profile via @route DELETE /api/nurses/:id
exports.deleteNurseProfile = async (req, res, next) => {
    try {
        const nurseProfile = await NurseProfile.findByPk(req.params.id);
        if (!nurseProfile) {
            return res.status(404).json({ message: 'Nurse profile not found' });
        }

        await nurseProfile.destroy();

        res.status(200).json({ message: 'Nurse profile deleted successfully' });

    } catch (error) {
        next(error);
    }
};
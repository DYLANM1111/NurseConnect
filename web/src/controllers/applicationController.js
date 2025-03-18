const { ShiftApplication, Shift, NurseProfile } = require('../models');
const { validationResult } = require('express-validator');

// Apply for a shift via @route POST /api/applications
exports.applyForShift = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { shift_id, nurse_id } = req.body;

        // Check if the shift exists
        const shift = await Shift.findByPk(shift_id);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Check if the nurse exists
        const nurse = await NurseProfile.findByPk(nurse_id);
        if (!nurse) {
            return res.status(404).json({ message: 'Nurse not found' });
        }

        // Check if the nurse has already applied for the shift
        const existingApplication = await ShiftApplication.findOne({
            where: { shift_id, nurse_id }
        });
        if (existingApplication) {
            return res.status(409).json({ message: 'Application already exists' });
        }

        // Create a new shift application
        const newApplication = await ShiftApplication.create({
            shift_id,
            nurse_id,
            status: 'pending'
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application: newApplication
        });

    } catch (error) {
        next(error);
    }
};

// Get all applications via @route GET /api/applications
exports.getAllApplications = async (req, res, next) => {
    try {
        const applications = await ShiftApplication.findAll({
            include: [
                { model: Shift, as: 'shift' },
                { model: NurseProfile, as: 'nurseProfile' }
            ]
        });

        res.status(200).json(applications);

    } catch (error) {
        next(error);
    }
};

// Get a specific application via @route GET /api/applications/:id
exports.getApplicationById = async (req, res, next) => {
    try {
        const application = await ShiftApplication.findByPk(req.params.id, {
            include: [
                { model: Shift, as: 'shift' },
                { model: NurseProfile, as: 'nurseProfile' }
            ]
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json(application);

    } catch (error) {
        next(error);
    }
};

// Update application status via @route PUT /api/applications/:id
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const application = await ShiftApplication.findByPk(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            message: 'Application status updated successfully',
            application
        });

    } catch (error) {
        next(error);
    }
};

// Delete an application via @route DELETE /api/applications/:id
exports.deleteApplication = async (req, res, next) => {
    try {
        const application = await ShiftApplication.findByPk(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        await application.destroy();

        res.status(200).json({ message: 'Application deleted successfully' });

    } catch (error) {
        next(error);
    }
};
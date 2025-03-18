const express = require('express');
const { body } = require('express-validator');
const nurseController = require('../controllers/nurseController');
const { authenticateJwt } = require('../config/passport');

const router = express.Router();

// Create a new nurse profile
router.post(
    '/',
    authenticateJwt,
    [
        body('user_id').isInt().withMessage('User ID must be an integer'),
        body('specialty').optional().isString().withMessage('Specialty must be a string'),
        body('years_experience').optional().isInt().withMessage('Years of experience must be an integer'),
        body('preferred_shift_type').optional().isArray().withMessage('Preferred shift type must be an array'),
        body('preferred_distance').optional().isInt().withMessage('Preferred distance must be an integer'),
        body('min_hourly_rate').optional().isDecimal().withMessage('Minimum hourly rate must be a decimal'),
        body('max_hourly_rate').optional().isDecimal().withMessage('Maximum hourly rate must be a decimal')
    ],
    nurseController.createNurseProfile
);

// Get all nurse profiles
router.get('/', authenticateJwt, nurseController.getAllNurseProfiles);

// Get a specific nurse profile by ID
router.get('/:id', authenticateJwt, nurseController.getNurseProfileById);

// Update a nurse profile
router.put(
    '/:id',
    authenticateJwt,
    [
        body('specialty').optional().isString().withMessage('Specialty must be a string'),
        body('years_experience').optional().isInt().withMessage('Years of experience must be an integer'),
        body('preferred_shift_type').optional().isArray().withMessage('Preferred shift type must be an array'),
        body('preferred_distance').optional().isInt().withMessage('Preferred distance must be an integer'),
        body('min_hourly_rate').optional().isDecimal().withMessage('Minimum hourly rate must be a decimal'),
        body('max_hourly_rate').optional().isDecimal().withMessage('Maximum hourly rate must be a decimal')
    ],
    nurseController.updateNurseProfile
);

// Delete a nurse profile
router.delete('/:id', authenticateJwt, nurseController.deleteNurseProfile);

module.exports = router;
const express = require('express');
const { body } = require('express-validator');
const shiftController = require('../controllers/shiftController');
const { authenticateJwt } = require('../config/passport');

const router = express.Router();

// Create a new shift
router.post(
    '/',
    authenticateJwt,
    [
        body('facility_id').isInt().withMessage('Facility ID must be an integer'),
        body('unit').notEmpty().withMessage('Unit is required'),
        body('shift_type').notEmpty().withMessage('Shift type is required'),
        body('start_time').isISO8601().withMessage('Start time must be a valid date'),
        body('end_time').isISO8601().withMessage('End time must be a valid date'),
        body('hourly_rate').isDecimal().withMessage('Hourly rate must be a decimal'),
        body('status').isIn(['open', 'assigned', 'completed', 'cancelled']).withMessage('Invalid status')
    ],
    shiftController.createShift
);

// Get all shifts
router.get('/', authenticateJwt, shiftController.getAllShifts);

// Get a specific shift by ID
router.get('/:id', authenticateJwt, shiftController.getShiftById);

// Update a shift
router.put(
    '/:id',
    authenticateJwt,
    [
        body('facility_id').isInt().withMessage('Facility ID must be an integer'),
        body('unit').notEmpty().withMessage('Unit is required'),
        body('shift_type').notEmpty().withMessage('Shift type is required'),
        body('start_time').isISO8601().withMessage('Start time must be a valid date'),
        body('end_time').isISO8601().withMessage('End time must be a valid date'),
        body('hourly_rate').isDecimal().withMessage('Hourly rate must be a decimal'),
        body('status').isIn(['open', 'assigned', 'completed', 'cancelled']).withMessage('Invalid status')
    ],
    shiftController.updateShift
);

// Delete a shift
router.delete('/:id', authenticateJwt, shiftController.deleteShift);

module.exports = router;
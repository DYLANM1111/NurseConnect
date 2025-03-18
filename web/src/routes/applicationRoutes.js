const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');
const { authenticateJwt } = require('../config/passport');

const router = express.Router();

// Apply for a shift
router.post(
    '/',
    authenticateJwt,
    [
        body('shift_id').isInt().withMessage('Shift ID must be an integer'),
        body('nurse_id').isInt().withMessage('Nurse ID must be an integer')
    ],
    applicationController.applyForShift
);

// Get all applications
router.get('/', authenticateJwt, applicationController.getAllApplications);

// Get a specific application by ID
router.get('/:id', authenticateJwt, applicationController.getApplicationById);

// Update application status
router.put(
    '/:id',
    authenticateJwt,
    [
        body('status').isIn(['pending', 'accepted', 'rejected']).withMessage('Invalid status')
    ],
    applicationController.updateApplicationStatus
);

// Delete an application
router.delete('/:id', authenticateJwt, applicationController.deleteApplication);

module.exports = router;
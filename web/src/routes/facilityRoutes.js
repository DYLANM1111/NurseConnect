const express = require('express');
const { body } = require('express-validator');
const facilityController = require('../controllers/facilityController');
const { authenticateJwt } = require('../config/passport');

const router = express.Router();

// Create a new facility
router.post(
    '/',
    authenticateJwt,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('address').notEmpty().withMessage('Address is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').isLength({ min: 2, max: 2 }).withMessage('State must be a 2-letter code'),
        body('zip_code').notEmpty().withMessage('Zip code is required')
    ],
    facilityController.createFacility
);

// Get all facilities
router.get('/', authenticateJwt, facilityController.getAllFacilities);

// Get a specific facility by ID
router.get('/:id', authenticateJwt, facilityController.getFacilityById);

// Update a facility
router.put(
    '/:id',
    authenticateJwt,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('address').notEmpty().withMessage('Address is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').isLength({ min: 2, max: 2 }).withMessage('State must be a 2-letter code'),
        body('zip_code').notEmpty().withMessage('Zip code is required')
    ],
    facilityController.updateFacility
);

// Delete a facility
router.delete('/:id', authenticateJwt, facilityController.deleteFacility);

module.exports = router;
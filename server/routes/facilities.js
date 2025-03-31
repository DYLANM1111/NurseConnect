// server/routes/facilities.js
const express = require('express');
const router = express.Router();
const { 
  getAllFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  searchFacilities
} = require('../controllers/facilityController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { facilityValidationRules, handleValidationErrors } = require('../middleware/validators');

// Get all facilities
router.get('/', authenticateToken, getAllFacilities);

// Get facility by ID
router.get('/:id', authenticateToken, getFacilityById);

// Create new facility
router.post('/', 
  authenticateToken, 
  isAdmin,
  facilityValidationRules,
  handleValidationErrors,
  createFacility
);

// Update facility
router.put('/:id', 
  authenticateToken, 
  isAdmin,
  facilityValidationRules,
  handleValidationErrors,
  updateFacility
);

// Delete facility
router.delete('/:id', authenticateToken, isAdmin, deleteFacility);

// Search facilities
router.get('/search', authenticateToken, searchFacilities);

module.exports = router;
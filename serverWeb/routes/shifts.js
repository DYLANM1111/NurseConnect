// server/routes/shifts.js
const express = require('express');
const router = express.Router();
const { 
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  getShiftsByFacility,
  getApplicationsByShiftId,
  updateShiftStatus
} = require('../controllers/shiftController');
const { updateApplicationStatus } = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/auth');
const { shiftValidationRules, handleValidationErrors } = require('../middleware/validators');

// Get all shifts (with optional filters)
router.get('/', authenticateToken, getAllShifts);

// Get shift by ID
router.get('/:id', authenticateToken, getShiftById);

// Create new shift
router.post('/', 
  authenticateToken, 
  shiftValidationRules,
  handleValidationErrors,
  createShift
);

// Update shift
router.put('/edit/:id', 
  authenticateToken, 
  shiftValidationRules,
  handleValidationErrors,
  updateShift
);

// Delete shift
router.delete('/:id', authenticateToken, deleteShift);

// Get shifts by facility
router.get('/facility/:facilityId', authenticateToken, getShiftsByFacility);

// Get applications by shift ID
router.get('/:shiftId/applications', authenticateToken, getApplicationsByShiftId);

// Get applications by shift ID (alternative route)
router.get('/:id/applications', authenticateToken, getApplicationsByShiftId);

// Update application status
router.patch('/applications/:id', updateApplicationStatus);

// Update shift status
router.patch('/:id/status', updateShiftStatus);

module.exports = router;
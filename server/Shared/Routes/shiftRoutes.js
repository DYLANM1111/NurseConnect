// Shared/Routes/shiftRoutes.js
import express from 'express';
import * as shiftController from '../Controller/shiftController.js';
// Assuming you have this middleware
// import { authMiddleware } from '../Middleware/auth.js';

const router = express.Router();

// Check if the controller functions exist before adding routes
console.log('Available controller methods:', Object.keys(shiftController));

// Only register routes for functions that exist
router.get('/shifts', shiftController.getAllShifts);

// Comment out routes with undefined handlers until you implement them
 router.get('/shifts/:id', shiftController.getShiftById);
// router.post('/shifts/:id/apply', authMiddleware, shiftController.applyForShift);

export { router };
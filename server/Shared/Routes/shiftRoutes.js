// Shared/Routes/shiftRoutes.js
import express from 'express';
import * as shiftController from '../Controller/shiftController.js';
// Assuming you have this middleware
// import { authMiddleware } from '../Middleware/auth.js';

const router = express.Router();

console.log('Available controller methods:', Object.keys(shiftController));

router.get('/shifts', shiftController.getAllShifts);

 router.get('/shifts/:id', shiftController.getShiftById);
 router.post('/shifts/:id/apply', shiftController.applyForShift); 

export { router };
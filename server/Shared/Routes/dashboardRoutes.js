// Shared/Routes/dashboardRoutes.js
import express from 'express';
import * as dashboardController from '../Controller/dashboardController.js';
 
const router = express.Router();

router.get('/users/:userId/earnings', dashboardController.getUserEarnings);
router.get('/users/:userId/shifts/upcoming', dashboardController.getUpcomingShift);
router.get('/users/:userId/shifts/completed', dashboardController.getCompletedShifts);

export default router ;
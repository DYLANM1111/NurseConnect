import express from 'express';
import { getNurseApplications, getApplicationDetails, withdrawApplication, updateApplicationStatus, getShiftApplications } from '../Controller/applicationsController.js';

const router = express.Router();

router.get('/nurses/:nurseId/applications', getNurseApplications);
router.get('/applications/:applicationId', getApplicationDetails);
router.post('/applications/:applicationId/withdraw', withdrawApplication);

router.get('/shifts/:shiftId/applications', getShiftApplications);
router.patch('/applications/:applicationId/status', updateApplicationStatus);

export default router;
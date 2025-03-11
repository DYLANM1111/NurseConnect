import express from 'express';
import nurseProfileController from '../Controller/nurseProfileController.js';
const router = express.Router();

console.log('Registering route: /nurses/:userId/profile');
router.get('/nurses/:userId/profile', nurseProfileController.getCompleteProfile);

export default router;
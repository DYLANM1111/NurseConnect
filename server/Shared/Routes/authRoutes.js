import express from 'express';
import * as authController from '../Controller/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
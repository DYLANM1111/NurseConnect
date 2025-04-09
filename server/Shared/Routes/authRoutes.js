import express from 'express';
import * as authController from '../Controller/authController.js';
import multer from 'multer';

const router = express.Router();
//const upload = multer({ dest: 'uploads/' }); 
// Add this to your routes
router.post('/test-body', (req, res) => {
    res.json({
      received: req.body
    });
  });
router.post('/register', authController.register);
router.post('/login', authController.login);
//router.post('/licenses/:licenseId/upload-document', authenticate, upload.single('document'), 
 // licenseController.uploadDocument);
//router.post('/certifications/:certId/upload-document', authenticate, upload.single('document'), 
  //certificationController.uploadDocument);

export default router;
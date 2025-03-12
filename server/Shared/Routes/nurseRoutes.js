import express from 'express';
import nurseProfileController from '../Controller/nurseProfileController.js';
const router = express.Router();

console.log('Registering route: /nurses/:userId/profile');
router.get('/nurses/:userId/profile', nurseProfileController.getCompleteProfile);


// Create nurse profile
router.post('/nurses/:userId/profile', nurseProfileController.createProfile);

// Update license 
//router.put('/licenses/:licenseId', uploadDocument, nurseProfileController.updateLicense);

router.put('/nurses/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;
    
    // Call controller method - you'll need to implement this in your controller
    const result = await nurseProfileController.updateProfile(userId, profileData);
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});



router.delete('/licenses/:licenseId', async (req, res) => {
  try {
    const { licenseId } = req.params;
    
    // Call controller method - you'll need to implement this in your controller
    const result = await nurseProfileController.deleteLicense(licenseId);
    
    return res.status(200).json({
      success: true,
      message: 'License deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting license:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete license',
      error: error.message
    });
  }
});


router.delete('/certifications/:certId', async (req, res) => {
  try {
    const { certId } = req.params;
    
    // Call controller method - you'll need to implement this in your controller
    const result = await nurseProfileController.deleteCertification(certId);
    
    return res.status(200).json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete certification',
      error: error.message
    });
  }
});

export default router;
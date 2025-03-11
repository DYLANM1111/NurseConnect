// controllers/nurseProfileController.js
import NurseProfile from '../Models/nurseModel.js';
import License from '../Models/License.js';
import Certification from '../Models/Certification.js';

class NurseProfileController {
 
  async getCompleteProfile(req, res) {
    try {
      const { userId } = req.params;
      console.log(`Attempting to fetch profile for user ID: ${userId}`);
      
      // Log before the database query
      console.log("About to execute database query");
      
      const profileData = await NurseProfile.fetchCompleteProfileData(userId);
      
      // Log the result
      console.log("Database query result:", profileData);
      
      if (!profileData) {
        console.log("No profile data found for this user");
        return res.status(404).json({ 
          success: false, 
          message: 'Profile not found' 
        });
      }
      
      // Define formatting inline to avoid 'this' binding issues
      const formattedProfile = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        phoneNumber: profileData.phone_number,
        nurseProfile: {
          id: profileData.nurse_profile_id,
          specialty: profileData.specialty,
          yearsExperience: profileData.years_experience,
          preferredShiftTypes: profileData.preferred_shift_type,
          preferredDistance: profileData.preferred_distance,
          hourlyRateRange: {
            min: profileData.min_hourly_rate,
            max: profileData.max_hourly_rate
          }
        },
        licenses: profileData.licenses || [],
        certifications: profileData.certifications || []
      };
      
      // Return formatted response
      return res.status(200).json({
        success: true,
        data: formattedProfile
      });
    } catch (error) {
      console.error('Error fetching complete profile:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch profile data',
        error: error.message 
      });
    }
  }
  // Format profile data for consistent API response
  formatProfileData(profileData) {
    // Transform database field names to camelCase if needed
    // Add any additional business logic for data formatting
    return {
      id: profileData.id,
      email: profileData.email,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      role: profileData.role,
      phoneNumber: profileData.phone_number,
      nurseProfile: {
        id: profileData.nurse_profile_id,
        specialty: profileData.specialty,
        yearsExperience: profileData.years_experience,
        preferredShiftTypes: profileData.preferred_shift_type,
        preferredDistance: profileData.preferred_distance,
        hourlyRateRange: {
          min: profileData.min_hourly_rate,
          max: profileData.max_hourly_rate
        }
      },
      licenses: profileData.licenses || [],
      certifications: profileData.certifications || []
    };
  }
  
  // Create nurse profile with related licenses and certifications
  async createProfile(req, res) {
    try {
      const { userId } = req.params;
      const { 
        nurseProfile, 
        licenses = [], 
        certifications = [] 
      } = req.body;
      
      // First create the nurse profile
      const profileResult = await NurseProfile.create({
        userId,
        ...nurseProfile
      });
      
      const nurseId = profileResult.id;
      
      // Then create licenses
      const licensePromises = licenses.map(license => 
        License.create(nurseId, license)
      );
      
      // And certifications
      const certPromises = certifications.map(cert => 
        Certification.create(nurseId, cert)
      );
      
      const [createdLicenses, createdCerts] = await Promise.all([
        Promise.all(licensePromises),
        Promise.all(certPromises)
      ]);
      
      // Get the complete profile data
      const completeProfile = await NurseProfile.fetchCompleteProfileData(userId);
      
      return res.status(201).json({
        success: true,
        message: 'Nurse profile created successfully',
        data: this.formatProfileData(completeProfile)
      });
    } catch (error) {
      console.error('Error creating nurse profile:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create nurse profile',
        error: error.message 
      });
    }
  }
  
  // Other controller methods for updating, deleting, etc.
  async updateLicense(req, res) {
    try {
      const { licenseId } = req.params;
      const licenseData = req.body;
      
      // If file upload is handled in middleware
      if (req.file) {
        licenseData.documentUrl = req.file.path;
      }
      
      const result = await License.update(licenseId, licenseData);
      
      if (!result) {
        return res.status(404).json({ 
          success: false, 
          message: 'License not found' 
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'License updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error updating license:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update license',
        error: error.message 
      });
    }
  }
  
}

export default new NurseProfileController();
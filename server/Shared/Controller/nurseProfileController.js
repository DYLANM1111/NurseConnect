// controllers/nurseProfileController.js
import NurseProfile from '../Models/nurseModel.js';
import License from '../Models/License.js';
import Certification from '../Models/Certification.js';
import userModel from '../Models/userModel.js'



class NurseProfileController {
 
  async getCompleteProfile(req, res) {
    try {
      const { userId } = req.params;
      console.log(`Attempting to fetch profile for user ID: ${userId}`);
      
      console.log("About to execute database query");
      
      const profileData = await NurseProfile.fetchCompleteProfileData(userId);
      
      console.log("Database query result:", profileData);
      
      if (!profileData) {
        console.log("No profile data found for this user");
        return res.status(404).json({ 
          success: false, 
          message: 'Profile not found' 
        });
      }
      
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
  formatProfileData(profileData) {
    
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
  
  async createProfile(req, res) {
    try {
      const { userId } = req.params;
      const { 
        nurseProfile, 
        licenses = [], 
        certifications = [] 
      } = req.body;
      
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

// Update profile

async updateProfile(userId, profileData) {
  try {
    const { nurseProfile, ...userData } = profileData;
    
    // Update user basic info (email, phone, etc.)
    if (userData && Object.keys(userData).length > 0) {
      console.log('Updating user data:', userData);
      await userModel.update(userId, userData);
    }
    
    // Update nurse-specific profile data
    if (nurseProfile) {
      console.log('Updating nurse profile data:', nurseProfile);
      
      // First, get the nurse profile ID for this user
      const nurseProfileData = await NurseProfile.findByUserId(userId);
      
      if (!nurseProfileData) {
        throw new Error('Nurse profile not found for this user');
      }
      
      // Now update using the profile ID (not the user ID)
      const profileId = nurseProfileData.id;
      console.log(`Found nurse profile ID: ${profileId} for user ID: ${userId}`);
      
      // Prepare the data for the update method
      // The NurseProfile.update method expects different property names
      const updateData = {
        specialty: nurseProfile.specialty,
        yearsExperience: nurseProfile.yearsExperience,
        preferredShiftTypes: nurseProfile.preferredShiftTypes,
        preferredDistance: nurseProfile.preferredDistance,
        minHourlyRate: nurseProfile.hourlyRateRange?.min,
        maxHourlyRate: nurseProfile.hourlyRateRange?.max
      };
      
      await NurseProfile.update(profileId, updateData);
    }
    
    // Get the updated complete profile
    const completeProfile = await NurseProfile.fetchCompleteProfileData(userId);
    
    return this.formatProfileData(completeProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile: ' + error.message);
  }
}
// Add a new license
async addLicense(userId, licenseData) {
  try {
    // First get the nurse profile ID from the user ID
    const nurseProfile = await NurseProfile.findByUserId(userId);
    
    if (!nurseProfile) {
      throw new Error('Nurse profile not found');
    }
    
    // Create the new license
    const newLicense = await License.create(nurseProfile.id, licenseData);
    
    return newLicense;
  } catch (error) {
    console.error('Error adding license:', error);
    throw new Error('Failed to add license: ' + error.message);
  }
}

// Delete a license
async deleteLicense(licenseId) {
  try {
    const result = await License.delete(licenseId);
    
    if (!result) {
      throw new Error('License not found');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting license:', error);
    throw new Error('Failed to delete license: ' + error.message);
  }
}

// Add a new certification
async addCertification(userId, certData) {
  try {
    // First get the nurse profile ID from the user ID
    const nurseProfile = await NurseProfile.findByUserId(userId);
    
    if (!nurseProfile) {
      throw new Error('Nurse profile not found');
    }
    
    // Create the new certification
    const newCert = await Certification.create(nurseProfile.id, certData);
    
    return newCert;
  } catch (error) {
    console.error('Error adding certification:', error);
    throw new Error('Failed to add certification: ' + error.message);
  }
}

// Update a certification
async updateCertification(certId, certData) {
  try {
    const result = await Certification.update(certId, certData);
    
    if (!result) {
      throw new Error('Certification not found');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating certification:', error);
    throw new Error('Failed to update certification: ' + error.message);
  }
}

// Delete a certification
async deleteCertification(certId) {
  try {
    const result = await Certification.delete(certId);
    
    if (!result) {
      throw new Error('Certification not found');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting certification:', error);
    throw new Error('Failed to delete certification: ' + error.message);
  }
}
}

export default new NurseProfileController();
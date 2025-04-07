import Application from '../Models/application.js';

export const getNurseApplications = async (req, res) => {
  try {
    const nurseId = req.params.nurseId;
    
    console.log(`Fetching applications for nurse ID: ${nurseId}`);
    
    const result = await Application.getByNurseId(nurseId);
    
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'No applications found for this nurse' });
    }
    
    // Format the applications for the mobile app
    const formattedApplications = result.rows.map(app => {
      // Format start and end time
      const startTime = new Date(app.start_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      const endTime = new Date(app.end_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      // Format date
      const date = new Date(app.start_time).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      // Calculate shift length
      const shiftLength = Math.round((new Date(app.end_time) - new Date(app.start_time)) / 3600000);
      
      return {
        id: app.id,
        shift_id: app.shift_id,
        status: app.status,
        submitted_at: app.created_at,
        hospital: app.hospital,
        unit: app.unit,
        date: date,
        startTime: startTime,
        endTime: endTime,
        hourlyRate: parseFloat(app.hourly_rate),
        specialty: app.specialty,
        urgentFill: app.urgent_fill,
        specialNotes: app.special_notes,
        shiftLength: shiftLength
      };
    });
    
    res.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching nurse applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getApplicationDetails = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    
    console.log(`Fetching application details for ID: ${applicationId}`);
    
    const result = await Application.getById(applicationId);
    
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const app = result.rows[0];
    
    // Format the application for the mobile app
    const formattedApplication = {
      id: app.id,
      shift_id: app.shift_id,
      nurse_id: app.nurse_id,
      status: app.status,
      submitted_at: app.created_at,
      updated_at: app.updated_at,
      hospital: app.hospital,
      unit: app.unit,
      date: new Date(app.start_time).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      startTime: new Date(app.start_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      endTime: new Date(app.end_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      hourlyRate: parseFloat(app.hourly_rate),
      specialty: app.specialty,
      urgentFill: app.urgent_fill,
      specialNotes: app.special_notes,
      availabilityConfirmed: app.availability_confirmed,
      facility_id: app.facility_id,
      shiftLength: Math.round((new Date(app.end_time) - new Date(app.start_time)) / 3600000)
    };
    
    res.json(formattedApplication);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const nurseId = req.body.nurseId;
    
    if (!nurseId) {
      return res.status(400).json({ error: 'Nurse ID is required' });
    }
    
    console.log(`Processing withdrawal for application ID: ${applicationId} by nurse ID: ${nurseId}`);
    
    try {
      const result = await Application.withdraw(applicationId, nurseId);
      
      if (!result || !result.rows || result.rows.length === 0) {
        return res.status(400).json({ error: 'Failed to withdraw application' });
      }
      
      res.json({
        message: 'Application withdrawn successfully',
        application: result.rows[0]
      });
    } catch (error) {
      if (error.message.includes('cannot be withdrawn')) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    console.log(`Updating application ID: ${applicationId} to status: ${status}`);
    
    try {
      const result = await Application.updateStatus(applicationId, status);
      
      if (!result || !result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      res.json({
        message: 'Application status updated successfully',
        application: result.rows[0]
      });
    } catch (error) {
      if (error.message.includes('Invalid status')) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getShiftApplications = async (req, res) => {
  try {
    const shiftId = req.params.shiftId;
    
    console.log(`Fetching applications for shift ID: ${shiftId}`);
    
    const result = await Application.getByShiftId(shiftId);
    
    // We don't return 404 for empty results here, just an empty array
    const applications = result.rows || [];
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching shift applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
import Shift from '../Models/shifts.js';


export const getAllShifts = async(req, res) => {
  try {
    const result = await Shift.getAll();
    
    // Check if result.rows exists (pool.query returns { rows: [] })
    const shifts = result.rows || result;
    
    // Make sure shifts is an array before mapping
    if (!Array.isArray(shifts)) {
      console.error('Unexpected result format:', shifts);
      return res.status(500).json({ error: 'Unexpected data format from database' });
    }

    const formattedShifts = shifts.map(shift => ({
      id: shift.id,
      hospital: shift.hospital,
      unit: shift.unit,
      date: new Date(shift.start_time).toISOString().split('T')[0],
      startTime: new Date(shift.start_time).toTimeString().slice(0, 5),
      endTime: new Date(shift.end_time).toTimeString().slice(0, 5),
      rate: parseFloat(shift.hourly_rate),
      specialty: shift.specialty,
      facilityRating: parseFloat(shift.facility_rating),
      urgentFill: shift.urgent_fill,
      // Calculate shift length in hours
      shiftLength: Math.round((new Date(shift.end_time) - new Date(shift.start_time)) / 3600000),
      // Add a default distance for now
      distance: '5.0 miles'
    }));
    
    res.json(formattedShifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getShiftById = async (req, res) => {
  try {
    const shiftId = req.params.id;
    
    console.log(`Fetching shift details for ID: ${shiftId}`);
    
    const result = await Shift.getById(shiftId);
    
    if (!result || !result.rows || result.rows.length === 0) {
      console.log(`Shift not found with ID: ${shiftId}`);
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    const shift = result.rows[0];
    
    const formattedShift = {
      id: shift.id,
      hospital: shift.hospital,
      unit: shift.unit,
      date: new Date(shift.start_time).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      startTime: new Date(shift.start_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      endTime: new Date(shift.end_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      rate: parseFloat(shift.hourly_rate),
      specialty: shift.specialty,
      facilityRating: parseFloat(shift.facility_rating),
      shiftLength: Math.round((new Date(shift.end_time) - new Date(shift.start_time)) / 3600000),
      distance: '5.0 miles', 
      urgentFill: shift.urgent_fill || false,
      requirements: shift.requirements || [],
      description: shift.description || 'No description provided',
      contact: shift.contact_info || 'Staffing Office'
    };
    
    res.json(formattedShift);
  } catch (error) {
    console.error('Error fetching shift by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
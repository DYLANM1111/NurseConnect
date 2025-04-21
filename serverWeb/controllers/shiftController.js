// server/controllers/shiftController.js
const Shift = require('../models/Shift');
const db = require('../config/db');

const getAllShifts = async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { facility_id, status, startDate, endDate } = req.query;
    
    const filters = {};
    if (facility_id) filters.facility_id = facility_id;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    const shifts = await Shift.findAll(filters);
    res.json(shifts);
  } catch (error) {
    console.error('Error getting shifts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getShiftById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT s.*, f.name AS facility_name
       FROM shifts s
       JOIN facilities f ON s.facility_id = f.id
       WHERE s.id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ error: 'Failed to fetch shift' });
  }
};

const createShift = async (req, res) => {
  const {
    facility_id,
    unit,
    shift_type,
    start_time,
    end_time,
    hourly_rate,
    status,
    requirements,
    urgent_fill,
    specialty,
    facility_rating,
    description,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO shifts (
        facility_id, unit, shift_type, start_time, end_time, hourly_rate, status, requirements, urgent_fill, specialty, facility_rating, description
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *`,
      [
        facility_id,
        unit,
        shift_type,
        start_time,
        end_time,
        hourly_rate,
        status,
        requirements,
        urgent_fill,
        specialty,
        facility_rating,
        description,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateShift = async (req, res) => {
  const { id } = req.params;
  const {
    facility_id,
    unit,
    shift_type,
    start_time,
    end_time,
    hourly_rate,
    status,
    requirements,
    urgent_fill,
    specialty,
    facility_rating,
    description,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE shifts
       SET facility_id = $1,
           unit = $2,
           shift_type = $3,
           start_time = $4,
           end_time = $5,
           hourly_rate = $6,
           status = $7,
           requirements = $8,
           urgent_fill = $9,
           specialty = $10,
           facility_rating = $11,
           description = $12,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        facility_id,
        unit,
        shift_type,
        start_time,
        end_time,
        hourly_rate,
        status,
        requirements,
        urgent_fill,
        specialty,
        facility_rating,
        description,
        id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteShift = async (req, res) => {
  try {
    const result = await Shift.delete(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getShiftsByFacility = async (req, res) => {
  try {
    const shifts = await Shift.findByFacility(req.params.facilityId);
    res.json(shifts);
  } catch (error) {
    console.error('Error getting facility shifts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getApplicationsByShiftId = async (req, res) => {
  const { shiftId } = req.params;

  try {
    const result = await db.query(
      `SELECT a.*, 
              u.first_name || ' ' || u.last_name AS nurse_name, 
              np.specialty, 
              np.years_experience, 
              a.special_notes AS nurse_description
       FROM applications a
       JOIN nurse_profiles np ON a.nurse_id = np.nurse_id -- Updated to use np.nurse_id
       JOIN users u ON np.user_id = u.id
       WHERE a.shift_id = $1`,
      [shiftId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'No applications found for this shift' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { id } = req.params; // Application ID
  const { status } = req.body; // New status

  try {
    const result = await db.query(
      `UPDATE applications
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

const updateShiftStatus = async (req, res) => {
  const { id } = req.params; // Shift ID
  const { status } = req.body; // New status

  try {
    const result = await db.query(
      `UPDATE shifts
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating shift status:', error);
    res.status(500).json({ error: 'Failed to update shift status' });
  }
};

module.exports = {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  getShiftsByFacility,
  getApplicationsByShiftId,
  updateApplicationStatus,
  updateShiftStatus,
};
// server/controllers/shiftController.js
const Shift = require('../models/Shift');

module.exports = {
  getAllShifts: async (req, res) => {
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
  },
  
  getShiftById: async (req, res) => {
    try {
      const shift = await Shift.findById(req.params.id);
      if (!shift) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      res.json(shift);
    } catch (error) {
      console.error('Error getting shift:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  createShift: async (req, res) => {
    try {
      const shift = await Shift.create(req.body);
      res.status(201).json(shift);
    } catch (error) {
      console.error('Error creating shift:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  updateShift: async (req, res) => {
    try {
      const shift = await Shift.update(req.params.id, req.body);
      if (!shift) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      res.json(shift);
    } catch (error) {
      console.error('Error updating shift:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  deleteShift: async (req, res) => {
    try {
      const result = await Shift.delete(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting shift:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  getShiftsByFacility: async (req, res) => {
    try {
      const shifts = await Shift.findByFacility(req.params.facilityId);
      res.json(shifts);
    } catch (error) {
      console.error('Error getting facility shifts:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
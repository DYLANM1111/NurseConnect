// server/controllers/facilityController.js
const Facility = require('../models/Facility');

module.exports = {
  getAllFacilities: async (req, res) => {
    try {
      const facilities = await Facility.findAll();
      res.json(facilities);
    } catch (error) {
      console.error('Error getting facilities:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  getFacilityById: async (req, res) => {
    try {
      const facility = await Facility.findById(req.params.id);
      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }
      res.json(facility);
    } catch (error) {
      console.error('Error getting facility:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  createFacility: async (req, res) => {
    try {
      const facility = await Facility.create(req.body);
      res.status(201).json(facility);
    } catch (error) {
      console.error('Error creating facility:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  updateFacility: async (req, res) => {
    try {
      const facility = await Facility.update(req.params.id, req.body);
      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }
      res.json(facility);
    } catch (error) {
      console.error('Error updating facility:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  deleteFacility: async (req, res) => {
    try {
      const result = await Facility.delete(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting facility:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  searchFacilities: async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const facilities = await Facility.search(query);
      res.json(facilities);
    } catch (error) {
      console.error('Error searching facilities:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
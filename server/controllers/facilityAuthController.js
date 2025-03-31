// server/controllers/facilityAuthController.js
const Facility = require('../models/Facility');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (facility) => {
  return jwt.sign(
    { 
      id: facility.id, 
      email: facility.contact_email,
      name: facility.name,
      type: 'facility'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if facility exists
      const facility = await Facility.findByEmail(email);
      if (!facility) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await Facility.comparePassword(password, facility.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(facility);
      
      // Remove password hash from response
      const { password_hash, ...facilityWithoutPassword } = facility;
      
      res.json({
        facility: facilityWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Error in facility login:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  register: async (req, res) => {
    try {
      const { 
        name, 
        address, 
        city, 
        state, 
        zip_code, 
        contact_name, 
        contact_phone, 
        contact_email,
        password
      } = req.body;
      
      // Check if facility already exists
      const existingFacility = await Facility.findByEmail(contact_email);
      if (existingFacility) {
        return res.status(400).json({ error: 'Facility with this email already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      // Create facility with password
      const newFacility = await Facility.create({
        name, 
        address, 
        city, 
        state, 
        zip_code, 
        contact_name, 
        contact_phone, 
        contact_email,
        password_hash
      });
      
      // Generate token
      const token = generateToken(newFacility);
      
      res.status(201).json({
        facility: newFacility,
        token
      });
    } catch (error) {
      console.error('Error in facility registration:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  getCurrentFacility: async (req, res) => {
    try {
      const facility = await Facility.findById(req.facility.id);
      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }
      
      res.json({ facility });
    } catch (error) {
      console.error('Error getting current facility:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
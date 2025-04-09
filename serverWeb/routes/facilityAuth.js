// server/routes/facilityAuth.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get database connection from config
const pool = require('../config/db');

// Login facility
router.post('/login', async (req, res) => {
  try {
    console.log('Facility login request:', req.body);
    const { email, password } = req.body;
    
    // Check if facility exists by contact email
    const facilityResult = await pool.query(
      'SELECT * FROM facilities WHERE contact_email = $1',
      [email]
    );
    
    const facility = facilityResult.rows[0];
    if (!facility) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // For testing purposes, skip password validation
    // In production, you would want to uncomment this:
    /*
    // Check password if hash exists
    if (facility.password_hash) {
      const isMatch = await bcrypt.compare(password, facility.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }
    */
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: facility.id, 
        email: facility.contact_email,
        type: 'facility'
      },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );
    
    // Remove sensitive data
    const { password_hash, ...facilityData } = facility;
    
    // Return facility data and token
    res.json({
      facility: facilityData,
      token
    });
  } catch (error) {
    console.error('Error in facility login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register facility
router.post('/register', async (req, res) => {
  try {
    console.log('Facility registration request:', req.body);
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
    const existingFacility = await pool.query(
      'SELECT * FROM facilities WHERE contact_email = $1',
      [contact_email]
    );
    
    if (existingFacility.rows.length > 0) {
      return res.status(400).json({ error: 'Facility with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create new facility
    const newFacilityResult = await pool.query(
      `INSERT INTO facilities 
      (name, address, city, state, zip_code, contact_name, contact_phone, contact_email, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [name, address, city, state, zip_code, contact_name, contact_phone, contact_email, password_hash]
    );
    
    const newFacility = newFacilityResult.rows[0];
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: newFacility.id, 
        email: newFacility.contact_email,
        type: 'facility'
      },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );
    
    // Remove sensitive data
    const { password_hash: ph, ...facilityData } = newFacility;
    
    // Return facility data and token
    res.status(201).json({
      facility: facilityData,
      token
    });
  } catch (error) {
    console.error('Error in facility registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current facility
router.get('/me', async (req, res) => {
  try {
    // The middleware should set req.facility
    const facilityResult = await pool.query(
      'SELECT * FROM facilities WHERE id = $1',
      [req.facility.id]
    );
    
    const facility = facilityResult.rows[0];
    
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    // Remove sensitive data
    const { password_hash, ...facilityData } = facility;
    
    res.json({ facility: facilityData });
  } catch (error) {
    console.error('Error getting facility:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
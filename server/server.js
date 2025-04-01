// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const facilityAuthRoutes = require('./routes/facilityAuth');

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow your frontend URL
  credentials: true
}));
app.use(express.json()); // This needs to be before routes to parse JSON bodies

// Use routes
app.use('/api/facility-auth', facilityAuthRoutes);

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Simple health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Nurse Connect API is running');
});

// User login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Query to find user by email
    const userQuery = `
      SELECT id, email, first_name, last_name, role, password_hash 
      FROM users 
      WHERE email = $1
    `;
    const userResult = await pool.query(userQuery, [email]);
    
    // Check if user exists
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Remove sensitive information before sending
    const { password_hash, ...userResponse } = user;

    res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Facility login endpoint
app.post('/api/facility-auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Query to find facility by email
    const facilityQuery = `
      SELECT id, name, contact_email, address, city, state, zip_code, password_hash 
      FROM facilities 
      WHERE contact_email = $1
    `;
    const facilityResult = await pool.query(facilityQuery, [email]);
    
    // Check if facility exists
    if (facilityResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const facility = facilityResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, facility.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: facility.id, 
        email: facility.contact_email, 
        type: 'facility' 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Remove sensitive information before sending
    const { password_hash, ...facilityResponse } = facility;

    res.json({
      facility: facilityResponse,
      token
    });
  } catch (error) {
    console.error('Facility login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Facility registration endpoint
app.post('/api/facility-auth/register', async (req, res) => {
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

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new facility into database
    const insertQuery = `
      INSERT INTO facilities 
      (name, address, city, state, zip_code, contact_name, contact_phone, contact_email, password_hash, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, name, address, city, state, zip_code, contact_name, contact_phone, contact_email, created_at
    `;
    
    const values = [
      name, 
      address, 
      city, 
      state, 
      zip_code, 
      contact_name, 
      contact_phone, 
      contact_email, 
      passwordHash
    ];

    const result = await pool.query(insertQuery, values);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.rows[0].id, 
        email: contact_email, 
        type: 'facility' 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      facility: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Facility registration error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all facilities endpoint
app.get('/api/facilities', async (req, res) => {
  try {
    // Query to get all facilities
    const query = `
      SELECT 
        id, 
        name, 
        address, 
        city, 
        state, 
        zip_code, 
        contact_name, 
        contact_phone, 
        contact_email
      FROM facilities
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting facilities:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get facility by ID
app.get('/api/facilities/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        address, 
        city, 
        state, 
        zip_code, 
        contact_name, 
        contact_phone, 
        contact_email
      FROM facilities
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting facility:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shifts endpoint
app.get('/api/shifts', async (req, res) => {
  try {
    // Query to get shifts with facility details
    const query = `
      SELECT 
        s.id, 
        s.facility_id, 
        f.name AS facility_name,
        s.unit, 
        s.shift_type, 
        s.start_time, 
        s.end_time, 
        s.hourly_rate, 
        s.status, 
        s.requirements
      FROM shifts s
      JOIN facilities f ON s.facility_id = f.id
      ORDER BY s.start_time
    `;
    
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting shifts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shift by ID
app.get('/api/shifts/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id, 
        s.facility_id, 
        f.name AS facility_name,
        s.unit, 
        s.shift_type, 
        s.start_time, 
        s.end_time, 
        s.hourly_rate, 
        s.status, 
        s.requirements
      FROM shifts s
      JOIN facilities f ON s.facility_id = f.id
      WHERE s.id = $1
    `;
    
    const result = await pool.query(query, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting shift:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create shift endpoint
app.post('/api/shifts', async (req, res) => {
  try {
    const { 
      facility_id, 
      unit, 
      shift_type, 
      start_time, 
      end_time, 
      hourly_rate, 
      status, 
      requirements 
    } = req.body;

    // Insert new shift into database
    const insertQuery = `
      INSERT INTO shifts 
      (facility_id, unit, shift_type, start_time, end_time, hourly_rate, status, requirements)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      facility_id, 
      unit, 
      shift_type, 
      start_time, 
      end_time, 
      hourly_rate, 
      status, 
      requirements
    ];

    const result = await pool.query(insertQuery, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection on startup
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err.stack);
    } else {
      console.log('Database connected successfully:', res.rows[0].now);
    }
  });
});

module.exports = { app, pool };
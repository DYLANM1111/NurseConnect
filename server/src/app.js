// app.js - Combined server and app setup
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import os from 'os';

import authRoutes from './../Shared/Routes/authRoutes.js';

// Database setup with hardcoded values
const { Pool } = pkg;
const pool = new Pool({
  user: 'dylanmuroki',         
  database: 'nurseconnect',   
  host: 'localhost',          
  port: 5432,                  
  password: '', // Leave blank if no password is set
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Make pool available globally
global.pool = pool;

// Initialize Express app
const app = express();
const port = 5001; // Hardcoded port

// Middleware
app.use(cors({
  origin: ['*'], // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error'
  });
});

// Print available IP addresses
const networkInterfaces = os.networkInterfaces();
console.log('Available IP addresses:');
Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`${interfaceName}: ${iface.address}`);
    }
  });
});

// Start server on all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

export default app;
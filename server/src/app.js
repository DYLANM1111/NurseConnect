// app.js - Combined server and app setup
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import os from 'os';
import applicationRoute from './../Shared/Routes/applicationRoute.js'
import authRoutes from './../Shared/Routes/authRoutes.js';
import nurseRoutes from './../Shared/Routes/nurseRoutes.js'
import dashboardRoutes from './../Shared/Routes/dashboardRoutes.js'
import { router as shiftRoutes } from './../Shared/Routes/shiftRoutes.js'


const { Pool } = pkg;

const pool = new Pool({
  user: 'database',                                 
  host: 'nurseconnect.postgres.database.azure.com', 
  database: 'nurseconnect',                             
  password: 'Nurseconnect!',                      
  port: 5432,                                      
  ssl: {
    rejectUnauthorized: false                      
  }
});
pool.on('connect', client => {
  client.query('SET search_path TO public');
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
app.use('/api', nurseRoutes);
app.use('/api', shiftRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', applicationRoute)

console.log('Registered routes:');
app._router.stack.forEach(function(r) {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`)
  } else if (r.name === 'router') {
    r.handle.stack.forEach(function(r) {
      if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods)} ${r.route.path}`)
      }
    })
  }
});
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
export { pool };

export default app;
// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  register: async (req, res) => {
    try {
      const { email, password, first_name, last_name, role, phone_number } = req.body;
      
      // Check if user already exists
      const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      // Create new user
      const newUserResult = await pool.query(
        `INSERT INTO users 
        (email, password_hash, first_name, last_name, role, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, role, phone_number, created_at, updated_at`,
        [email, password_hash, first_name, last_name, role, phone_number]
      );
      
      const newUser = newUserResult.rows[0];
      
      // Generate JWT token
      const token = generateToken(newUser);
      
      res.status(201).json({
        user: newUser,
        token
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  me: async (req, res) => {
    try {
      const userResult = await pool.query(
        'SELECT id, email, first_name, last_name, role, phone_number, created_at, updated_at FROM users WHERE id = $1',
        [req.user.id]
      );
      
      const user = userResult.rows[0];
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Error in me:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
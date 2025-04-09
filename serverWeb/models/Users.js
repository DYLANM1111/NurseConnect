// server/models/User.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  findById: async (id) => {
    try {
      const result = await db.query(
        'SELECT id, email, first_name, last_name, role, phone_number, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  findByEmail: async (email) => {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  create: async (userData) => {
    const { email, password, first_name, last_name, role, phone_number } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    try {
      const result = await db.query(
        `INSERT INTO users 
        (email, password_hash, first_name, last_name, role, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, role, phone_number, created_at, updated_at`,
        [email, password_hash, first_name, last_name, role, phone_number]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id, userData) => {
    const { email, first_name, last_name, phone_number } = userData;
    
    try {
      const result = await db.query(
        `UPDATE users 
        SET email = $1, first_name = $2, last_name = $3, phone_number = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, email, first_name, last_name, role, phone_number, created_at, updated_at`,
        [email, first_name, last_name, phone_number, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  updatePassword: async (id, password) => {
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    try {
      const result = await db.query(
        `UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id`,
        [password_hash, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  }
};

module.exports = User;
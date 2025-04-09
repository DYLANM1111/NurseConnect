// server/models/Facility.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Make sure everything is inside the module.exports object
const Facility = {
  findById: async (id) => {
    try {
      const result = await db.query(
        'SELECT * FROM facilities WHERE id = $1',
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
        'SELECT * FROM facilities WHERE contact_email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  create: async (facilityData) => {
    const { 
      name, 
      address, 
      city, 
      state, 
      zip_code, 
      contact_name, 
      contact_phone, 
      contact_email,
      password_hash 
    } = facilityData;
    
    try {
      const result = await db.query(
        `INSERT INTO facilities 
        (name, address, city, state, zip_code, contact_name, contact_phone, contact_email, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [name, address, city, state, zip_code, contact_name, contact_phone, contact_email, password_hash]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Add other methods like update, delete, etc.
  
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  }
};

module.exports = Facility;
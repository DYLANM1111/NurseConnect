// server/models/Shift.js
const db = require('../config/db');

const Shift = {
  findById: async (id) => {
    try {
      const result = await db.query(
        `SELECT s.*, f.name as facility_name
        FROM shifts s
        JOIN facilities f ON s.facility_id = f.id
        WHERE s.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  findAll: async (filters = {}) => {
    try {
      let query = `
        SELECT s.*, f.name as facility_name
        FROM shifts s
        JOIN facilities f ON s.facility_id = f.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      let paramCounter = 1;
      
      // Add filters
      if (filters.facility_id) {
        query += ` AND s.facility_id = $${paramCounter++}`;
        queryParams.push(filters.facility_id);
      }
      
      if (filters.status) {
        query += ` AND s.status = $${paramCounter++}`;
        queryParams.push(filters.status);
      }
      
      if (filters.startDate) {
        query += ` AND s.start_time >= $${paramCounter++}`;
        queryParams.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ` AND s.end_time <= $${paramCounter++}`;
        queryParams.push(filters.endDate);
      }
      
      // Add sorting
      query += ` ORDER BY s.start_time ASC`;
      
      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (shiftData) => {
    const { 
      facility_id, 
      unit, 
      shift_type, 
      start_time, 
      end_time, 
      hourly_rate, 
      status,
      requirements 
    } = shiftData;
    
    try {
      const result = await db.query(
        `INSERT INTO shifts 
        (facility_id, unit, shift_type, start_time, end_time, hourly_rate, status, requirements)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [facility_id, unit, shift_type, start_time, end_time, hourly_rate, status || 'open', requirements || []]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id, shiftData) => {
    const { 
      facility_id, 
      unit, 
      shift_type, 
      start_time, 
      end_time, 
      hourly_rate, 
      status,
      requirements 
    } = shiftData;
    
    try {
      const result = await db.query(
        `UPDATE shifts 
        SET facility_id = $1, unit = $2, shift_type = $3, start_time = $4, end_time = $5,
            hourly_rate = $6, status = $7, requirements = $8, updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *`,
        [facility_id, unit, shift_type, start_time, end_time, hourly_rate, status, requirements, id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await db.query('DELETE FROM shifts WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  
  findByFacility: async (facilityId) => {
    try {
      const result = await db.query(
        `SELECT s.*, f.name as facility_name
        FROM shifts s
        JOIN facilities f ON s.facility_id = f.id
        WHERE s.facility_id = $1
        ORDER BY s.start_time ASC`,
        [facilityId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Shift;
// Models/shifts.js
import {pool} from '../../src/app.js';

class Shift {
  static async getAll() {
    try {
      const query = `
        SELECT 
          s.id,
          s.unit,
          s.shift_type,
          s.start_time,
          s.end_time,
          s.hourly_rate,
          s.status,
          s.requirements,
          s.specialty,
          s.facility_rating,
          s.urgent_fill,
          s.description,
          f.name AS hospital
        FROM 
          shifts s
        JOIN 
          facilities f ON s.facility_id = f.id
        WHERE 
          s.status = 'open'
        ORDER BY 
          s.start_time ASC
      `;
      
      const result = await pool.query(query);
      return result;
    } catch (error) {
      console.error('Error in Shift.getAll:', error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const query = `
        SELECT 
          s.id,
          s.unit,
          s.shift_type,
          s.start_time,
          s.end_time,
          s.hourly_rate,
          s.status,
          s.requirements,
          s.specialty,
          s.urgent_fill,
          s.facility_rating,
          s.description,
          f.name AS hospital,
          f.contact_phone AS contact_info
        FROM 
          shifts s
        JOIN 
          facilities f ON s.facility_id = f.id
        WHERE 
          s.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      return result;
    } catch (error) {
      console.error('Error in Shift.getById:', error);
      throw error;
    }
  }
  
  static async checkExistingApplication(shiftId, nurseId) {
    try {
      const query = `
        SELECT id 
        FROM applications 
        WHERE shift_id = $1 AND nurse_id = $2
      `;
      const result = await pool.query(query, [shiftId, nurseId]);
      return result;
    } catch (error) {
      console.error('Error checking existing application:', error);
      throw error;
    }
  }
  
  static async createApplication(applicationData) {
    try {
      const { shift_id, nurse_id, special_notes, availability_confirmed } = applicationData;
      
      const query = `
        INSERT INTO applications 
          (shift_id, nurse_id, special_notes, availability_confirmed) 
        VALUES 
          ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const values = [
        shift_id,
        nurse_id,
        special_notes || null,
        availability_confirmed
      ];
      
      const result = await pool.query(query, values);
      return result;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }
}

export default Shift;
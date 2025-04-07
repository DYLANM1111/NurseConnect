import {pool} from '../../src/app.js';

class Application {
  static async getByNurseId(nurseId) {
    try {
      const query = `
        SELECT 
          a.id,
          a.shift_id,
          a.status,
          a.special_notes,
          a.availability_confirmed,
          a.created_at,
          a.updated_at,
          s.unit,
          s.start_time,
          s.end_time,
          s.hourly_rate,
          s.specialty,
          s.urgent_fill,
          f.name as hospital
        FROM 
          applications a
        JOIN 
          shifts s ON a.shift_id = s.id
        JOIN 
          facilities f ON s.facility_id = f.id
        WHERE 
          a.nurse_id = $1
        ORDER BY 
          a.created_at DESC
      `;
      
      const result = await pool.query(query, [nurseId]);
      return result;
    } catch (error) {
      console.error('Error in Application.getByNurseId:', error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const query = `
        SELECT 
          a.id,
          a.shift_id,
          a.nurse_id,
          a.status,
          a.special_notes,
          a.availability_confirmed,
          a.created_at,
          a.updated_at,
          s.unit,
          s.start_time,
          s.end_time,
          s.hourly_rate,
          s.specialty,
          s.urgent_fill,
          f.name as hospital,
          f.id as facility_id
        FROM 
          applications a
        JOIN 
          shifts s ON a.shift_id = s.id
        JOIN 
          facilities f ON s.facility_id = f.id
        WHERE 
          a.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      return result;
    } catch (error) {
      console.error('Error in Application.getById:', error);
      throw error;
    }
  }
  
  static async withdraw(id, nurseId) {
    try {
      // First verify this belongs to the nurse
      const verifyQuery = `
        SELECT * FROM applications 
        WHERE id = $1 AND nurse_id = $2 AND status = 'pending'
      `;
      
      const verifyResult = await pool.query(verifyQuery, [id, nurseId]);
      
      if (verifyResult.rows.length === 0) {
        throw new Error('Application not found or cannot be withdrawn');
      }
      
      const query = `
        UPDATE applications 
        SET 
          status = 'withdrawn',
          updated_at = CURRENT_TIMESTAMP
        WHERE 
          id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [id]);
      return result;
    } catch (error) {
      console.error('Error in Application.withdraw:', error);
      throw error;
    }
  }
  
  static async updateStatus(id, status) {
    try {
      const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
      
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }
      
      const query = `
        UPDATE applications 
        SET 
          status = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE 
          id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [id, status]);
      return result;
    } catch (error) {
      console.error('Error in Application.updateStatus:', error);
      throw error;
    }
  }
  
  static async getByShiftId(shiftId) {
    try {
      const query = `
        SELECT 
          a.*,
          np.specialty,
          np.years_experience,
          u.first_name,
          u.last_name,
          u.email
        FROM 
          applications a
        JOIN 
          nurse_profiles np ON a.nurse_id = np.id
        JOIN 
          users u ON np.user_id = u.id
        WHERE 
          a.shift_id = $1
        ORDER BY 
          a.created_at ASC
      `;
      
      const result = await pool.query(query, [shiftId]);
      return result;
    } catch (error) {
      console.error('Error in Application.getByShiftId:', error);
      throw error;
    }
  }
}

export default Application;
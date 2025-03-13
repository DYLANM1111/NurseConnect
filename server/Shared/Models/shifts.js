import {pool} from '../../src/app.js';


class Shift {
  static async getAll() {
    return pool.query(`
      SELECT s.*, f.name as hospital
      FROM shifts s
      JOIN facilities f ON s.facility_id = f.id
      WHERE s.status = 'open'
      ORDER BY s.start_time
    `);
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
}

export default Shift;


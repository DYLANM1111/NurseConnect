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
    return pool.query(`
      SELECT s.*, f.name as hospital, f.address, f.city, f.state, f.zip_code
      FROM shifts s
      JOIN facilities f ON s.facility_id = f.id
      WHERE s.id = $1
    `, [id]);
  }

}

export default Shift;


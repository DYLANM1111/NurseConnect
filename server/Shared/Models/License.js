// models/License.js
import pool from '../../src/app.js';

class License {
  static async create(nurseId, licenseData) {
    const query = `
      INSERT INTO licenses (
        nurse_id, license_type, license_number, state,
        expiry_date, status, verification_status, document_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      nurseId,
      licenseData.licenseType,
      licenseData.licenseNumber,
      licenseData.state,
      licenseData.expiryDate,
      licenseData.status || 'active',
      licenseData.verificationStatus || 'pending',
      licenseData.documentUrl
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findById(licenseId) {
    const query = 'SELECT * FROM licenses WHERE id = $1';
    const result = await pool.query(query, [licenseId]);
    return result.rows[0];
  }
  
  static async findByNurseId(nurseId) {
    const query = 'SELECT * FROM licenses WHERE nurse_id = $1';
    const result = await pool.query(query, [nurseId]);
    return result.rows;
  }
  
  static async update(licenseId, licenseData) {
    const query = `
      UPDATE licenses
      SET
        license_type = $1,
        license_number = $2,
        state = $3,
        expiry_date = $4,
        status = $5,
        document_url = COALESCE($6, document_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      licenseData.licenseType,
      licenseData.licenseNumber,
      licenseData.state,
      licenseData.expiryDate,
      licenseData.status || 'active',
      licenseData.documentUrl,
      licenseId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async delete(licenseId) {
    const query = 'DELETE FROM licenses WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [licenseId]);
    return result.rows[0];
  }
}

export default License;
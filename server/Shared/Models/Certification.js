// models/Certification.js
import pool from '../../src/app.js';

class Certification {
  static async create(nurseId, certData) {
    const query = `
      INSERT INTO certifications (
        nurse_id, certification_name, issuing_body,
        expiry_date, status, document_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      nurseId,
      certData.certificationName,
      certData.issuingBody,
      certData.expiryDate,
      certData.status || 'active',
      certData.documentUrl
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findById(certId) {
    const query = 'SELECT * FROM certifications WHERE id = $1';
    const result = await pool.query(query, [certId]);
    return result.rows[0];
  }
  
  static async findByNurseId(nurseId) {
    const query = 'SELECT * FROM certifications WHERE nurse_id = $1';
    const result = await pool.query(query, [nurseId]);
    return result.rows;
  }
  
  static async update(certId, certData) {
    const query = `
      UPDATE certifications
      SET
        certification_name = $1,
        issuing_body = $2,
        expiry_date = $3,
        status = $4,
        document_url = COALESCE($5, document_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [
      certData.certificationName,
      certData.issuingBody,
      certData.expiryDate,
      certData.status || 'active',
      certData.documentUrl,
      certId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async delete(certId) {
    const query = 'DELETE FROM certifications WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [certId]);
    return result.rows[0];
  }
}

export default Certification;
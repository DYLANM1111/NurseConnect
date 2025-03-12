
import {pool} from '../../src/app.js';

class NurseProfile {
  static async create(nurseProfileData) {
    const query = `
      INSERT INTO nurse_profiles (
        user_id, specialty, years_experience, preferred_shift_type,
        preferred_distance, min_hourly_rate, max_hourly_rate
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    const values = [
      nurseProfileData.userId,
      nurseProfileData.specialty,
      parseInt(nurseProfileData.yearsExperience),
      nurseProfileData.preferredShiftTypes,
      parseInt(nurseProfileData.preferredDistance),
      parseFloat(nurseProfileData.minHourlyRate),
      parseFloat(nurseProfileData.maxHourlyRate)
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findByUserId(userId) {
    const query = 'SELECT * FROM nurse_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
  
  static async update(profileId, nurseProfileData) {
    const query = `
      UPDATE nurse_profiles
      SET 
        specialty = $1,
        years_experience = $2,
        preferred_shift_type = $3,
        preferred_distance = $4,
        min_hourly_rate = $5,
        max_hourly_rate = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      nurseProfileData.specialty,
      parseInt(nurseProfileData.yearsExperience),
      nurseProfileData.preferredShiftTypes,
      parseInt(nurseProfileData.preferredDistance),
      parseFloat(nurseProfileData.minHourlyRate),
      parseFloat(nurseProfileData.maxHourlyRate),
      profileId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async delete(profileId) {
    const query = 'DELETE FROM nurse_profiles WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [profileId]);
    return result.rows[0];
  }
  
  static async fetchCompleteProfileData(userId) {
    const query = `
      WITH nurse_data AS (
        SELECT 
          np.id AS nurse_profile_id,
          np.user_id,
          np.specialty,
          np.years_experience,
          np.preferred_shift_type,
          np.preferred_distance,
          np.min_hourly_rate,
          np.max_hourly_rate
        FROM 
          nurse_profiles np
        WHERE 
          np.user_id = $1
      ),
      user_data AS (
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          u.phone_number
        FROM 
          users u
        WHERE 
          u.id = $1
      ),
      license_data AS (
        SELECT 
          l.id,
          l.license_type,
          l.license_number,
          l.state,
          l.expiry_date,
          l.status,
          l.verification_status,
          l.document_url
        FROM 
          licenses l
        JOIN 
          nurse_data nd ON l.nurse_id = nd.nurse_profile_id
      ),
      certification_data AS (
        SELECT 
          c.id,
          c.certification_name,
          c.issuing_body,
          c.expiry_date,
          c.status,
          c.document_url
        FROM 
          certifications c
        JOIN 
          nurse_data nd ON c.nurse_id = nd.nurse_profile_id
      )
      SELECT 
        ud.*,
        nd.*,
        COALESCE(json_agg(DISTINCT ld) FILTER (WHERE ld.id IS NOT NULL), '[]') AS licenses,
        COALESCE(json_agg(DISTINCT cd) FILTER (WHERE cd.id IS NOT NULL), '[]') AS certifications
      FROM 
        user_data ud
      LEFT JOIN 
        nurse_data nd ON ud.id = nd.user_id
      LEFT JOIN 
        license_data ld ON nd.nurse_profile_id IS NOT NULL
      LEFT JOIN 
        certification_data cd ON nd.nurse_profile_id IS NOT NULL
      GROUP BY 
        ud.id, ud.email, ud.first_name, ud.last_name, ud.role, ud.phone_number,
        nd.nurse_profile_id, nd.user_id, nd.specialty, nd.years_experience, 
        nd.preferred_shift_type, nd.preferred_distance, nd.min_hourly_rate, nd.max_hourly_rate
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

export default NurseProfile;
import pool from '../../database/config/config';

class NurseProfile {
  static async create(nurseProfileData) {
    const { 
      userId, 
      specialty, 
      yearsExperience, 
      preferredShiftTypes, 
      preferredDistance, 
      minHourlyRate, 
      maxHourlyRate 
    } = nurseProfileData;
    
    const query = `
      INSERT INTO nurse_profiles (
        user_id,
        specialty,
        years_experience,
        preferred_shift_type,
        preferred_distance,
        min_hourly_rate,
        max_hourly_rate
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    const values = [
      userId,
      specialty,
      parseInt(yearsExperience),
      preferredShiftTypes,
      parseInt(preferredDistance),
      parseFloat(minHourlyRate),
      parseFloat(maxHourlyRate)
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findByUserId(userId) {
    const query = 'SELECT * FROM nurse_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
  
  // Update nurse profile
  static async update(profileId, nurseProfileData) {
    const { 
      specialty, 
      yearsExperience, 
      preferredShiftTypes, 
      preferredDistance, 
      minHourlyRate, 
      maxHourlyRate 
    } = nurseProfileData;
    
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
      specialty,
      parseInt(yearsExperience),
      preferredShiftTypes,
      parseInt(preferredDistance),
      parseFloat(minHourlyRate),
      parseFloat(maxHourlyRate),
      profileId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

export default NurseProfile;
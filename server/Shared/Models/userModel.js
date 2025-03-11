import bcrypt from 'bcrypt';
import pool from '../../src/app.js';

class User {
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async create(userData) {
    const { email, password, firstName, lastName, role, phoneNumber } = userData;
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        phone_number
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, email, first_name, last_name, role, phone_number, created_at
    `;
    
    const values = [email, passwordHash, firstName, lastName, role, phoneNumber];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  static async getWithProfile(userId) {
    const query = `
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.phone_number,
        np.id as nurse_profile_id,
        np.specialty,
        np.years_experience,
        np.preferred_shift_type,
        np.preferred_distance,
        np.min_hourly_rate,
        np.max_hourly_rate
      FROM users u
      LEFT JOIN nurse_profiles np ON u.id = np.user_id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

export default User;
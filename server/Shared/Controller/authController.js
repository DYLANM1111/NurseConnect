// Controller/authController.js
console.log("Loading auth controller...");
import bcrypt from 'bcrypt';

// Controller for user registration
export const register = async (req, res) => {
  // Use the global pool that was set in app.js
  const client = await global.pool.connect();
  
  try {
    // Destructure request body
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber, 
      role,
      specialty,
      yearsExperience,
      preferredShiftTypes,
      preferredDistance,
      minHourlyRate,
      maxHourlyRate
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide all required fields' 
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if user already exists
    const userExists = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        phone_number
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, email, first_name, last_name, role, phone_number, created_at`,
      [email, passwordHash, firstName, lastName, role, phoneNumber]
    );
    
    const newUser = userResult.rows[0];
    
    // If user is a nurse, create nurse profile
    if (role === 'nurse') {
      // Validate nurse-specific fields
      if (!specialty || !yearsExperience || !preferredShiftTypes || 
          !preferredDistance || !minHourlyRate || !maxHourlyRate) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: 'Please provide all required nurse profile fields' 
        });
      }
      
      // Insert nurse profile
      const nurseResult = await client.query(
        `INSERT INTO nurse_profiles (
          user_id,
          specialty,
          years_experience,
          preferred_shift_type,
          preferred_distance,
          min_hourly_rate,
          max_hourly_rate
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          newUser.id,
          specialty,
          parseInt(yearsExperience),
          preferredShiftTypes, // This should be an array
          parseInt(preferredDistance),
          parseFloat(minHourlyRate),
          parseFloat(maxHourlyRate)
        ]
      );
      
      newUser.nurseProfileId = nurseResult.rows[0].id;
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Return success with user info
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error registering user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during registration' 
    });
  } finally {
    // Release client back to pool
    client.release();
  }
};

// Controller for user login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }
    
    // Get user from database - use global.pool
    const userResult = await global.pool.query(
      `SELECT 
        u.id, 
        u.email, 
        u.password_hash, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.phone_number,
        np.id as nurse_profile_id
      FROM users u
      LEFT JOIN nurse_profiles np ON u.id = np.user_id
      WHERE u.email = $1`,
      [email]
    );
    
    // Check if user exists
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    delete user.password_hash;
    
    res.json({
      success: true,
      message: 'Login successful',
      user
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login' 
    });
  }
};
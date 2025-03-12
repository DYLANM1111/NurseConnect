console.log("Loading auth controller...");
import bcrypt from 'bcrypt';

// Controller for user registration
export const register = async (req, res) => {
  const client = await global.pool.connect();
  
  try {
    console.log("Connected to DB for registration");

    // Destructure request body with nested structure
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber, 
      role,
      nurseProfile,  
      licenses,      
      certifications 
    } = req.body;
    
    console.log('Incoming registration data:', req.body);

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide all required fields' 
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    console.log('Transaction started');

    // Check if user already exists
    const userExists = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      console.log('User already exists:', email);
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
    console.log('Inserting user:', { email, firstName, lastName, role, phoneNumber });
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
    console.log('User inserted successfully:', newUser);

    // If user is a nurse, create nurse profile
    if (role === 'nurse' && nurseProfile) {
      console.log('Inserting nurse profile for:', newUser.id);

      const { specialty, yearsExperience, preferredShiftTypes, 
              preferredDistance, minHourlyRate, maxHourlyRate } = nurseProfile;
              
      if (!specialty || !yearsExperience || !preferredShiftTypes || 
          !preferredDistance || !minHourlyRate || !maxHourlyRate) {
        await client.query('ROLLBACK');
        console.log('Missing nurse profile fields');
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
          preferredShiftTypes,
          parseInt(preferredDistance),
          parseFloat(minHourlyRate),
          parseFloat(maxHourlyRate)
        ]
      );
      
      const nurseProfileId = nurseResult.rows[0].id;
      console.log('Nurse profile inserted successfully:', nurseProfileId);
      newUser.nurseProfileId = nurseProfileId;
      
      // Process licenses if provided
      if (licenses && licenses.length > 0) {
        console.log(`Inserting ${licenses.length} licenses`);
        for (const license of licenses) {
          const { licenseType, licenseNumber, state, expiryDate } = license;
          
          if (!licenseType || !licenseNumber || !state || !expiryDate) {
            await client.query('ROLLBACK');
            console.log('Missing license fields');
            return res.status(400).json({
              success: false,
              error: 'Please provide all required license fields'
            });
          }
          
          await client.query(
            `INSERT INTO licenses (
              nurse_id,
              license_type,
              license_number,
              state,
              expiry_date,
              status
            )
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              nurseProfileId,
              licenseType,
              licenseNumber,
              state,
              expiryDate,
              'active'
            ]
          );
        }
        console.log('Licenses inserted successfully');
      }
      
      // Process certifications if provided
      if (certifications && certifications.length > 0) {
        console.log(`Inserting ${certifications.length} certifications`);
        for (const cert of certifications) {
          const { certificationName, issuingBody, expiryDate } = cert;
          
          if (!certificationName || !issuingBody || !expiryDate) {
            await client.query('ROLLBACK');
            console.log('Missing certification fields');
            return res.status(400).json({
              success: false,
              error: 'Please provide all required certification fields'
            });
          }
          
          await client.query(
            `INSERT INTO certifications (
              nurse_id,
              certification_name,
              issuing_body,
              expiry_date,
              status
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
              nurseProfileId,
              certificationName,
              issuingBody,
              expiryDate,
              'active'
            ]
          );
        }
        console.log('Certifications inserted successfully');
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Transaction committed successfully');
    
    // Return success with user info
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error registering user:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      error: `Server error during registration: ${error.message}` 
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
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }
    
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
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    const user = userResult.rows[0];
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
    console.error('Error during login:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      error: `Server error during login: ${error.message}` 
    });
  }
};

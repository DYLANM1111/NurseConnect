-- server/db/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('nurse', 'admin')),
  phone_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nurse Profiles table
CREATE TABLE nurse_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  specialty VARCHAR(100),
  years_experience INTEGER,
  preferred_shift_type VARCHAR(50)[] DEFAULT '{}',
  preferred_distance INTEGER,
  min_hourly_rate DECIMAL(10,2),
  max_hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nurse_id UUID REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  license_type VARCHAR(100) NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'expired', 'suspended')),
  verification_status VARCHAR(50) DEFAULT 'pending',
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Certifications table
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nurse_id UUID REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  certification_name VARCHAR(100) NOT NULL,
  issuing_body VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'expired')),
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facilities table
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shifts table
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  unit VARCHAR(100) NOT NULL,
  shift_type VARCHAR(50) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add shift_applications table to track nurse applications for shifts
CREATE TABLE shift_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  nurse_id UUID REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shift_id, nurse_id)
);

-- Add shift_assignments table to track assigned shifts
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  nurse_id UUID REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shift_id)
);

-- Add indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_facility_id ON shifts(facility_id);
CREATE INDEX idx_shift_applications_nurse_id ON shift_applications(nurse_id);
CREATE INDEX idx_shift_applications_shift_id ON shift_applications(shift_id);
CREATE INDEX idx_shift_assignments_nurse_id ON shift_assignments(nurse_id);
CREATE INDEX idx_shift_assignments_shift_id ON shift_assignments(shift_id);
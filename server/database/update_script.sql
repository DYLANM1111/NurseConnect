
-- Add new columns to shifts table
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS urgent_fill BOOLEAN DEFAULT FALSE;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS facility_rating DECIMAL(3,1);
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS description TEXT;

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    nurse_id UUID REFERENCES nurse_profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    special_notes TEXT,
    availability_confirmed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shift_id, nurse_id)  -- Prevent duplicate applications
);

-- Notifications table for application updates
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_nurse_id ON applications(nurse_id);
CREATE INDEX IF NOT EXISTS idx_applications_shift_id ON applications(shift_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_specialty ON shifts(specialty);
-- ===============================
-- Add password_updated_at column to profiles table
-- ===============================

-- Add password_updated_at column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS password_updated_at timestamp with time zone DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_password_updated_at ON profiles(password_updated_at);

-- Add is_admin column to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- Optional: Create a function to check if user is admin
-- This can be used in RLS policies if needed
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = user_uuid AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: After running this script, manually set your account's is_admin to TRUE in Supabase Dashboard:
-- 1. Go to Table Editor → profiles
-- 2. Find your profile row
-- 3. Set is_admin to TRUE
-- 4. Save


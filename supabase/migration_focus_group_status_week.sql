-- Migration: Add status and current_week columns to profiles table
-- Purpose: Support focus group workflow states and week tracking
-- Rollback: ALTER TABLE profiles DROP COLUMN IF EXISTS status, DROP COLUMN IF EXISTS current_week;

-- Add status column for workflow state tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('onboard_pending', 'profile_complete', 'week_active', 'study_complete'));

-- Add current_week column for tracking participant progress
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_week INTEGER CHECK (current_week IS NULL OR current_week > 0);

-- Create index for status queries (admin dashboard will filter by status)
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Create index for current_week queries
CREATE INDEX IF NOT EXISTS idx_profiles_current_week ON profiles(current_week);

-- Add comment for documentation
COMMENT ON COLUMN profiles.status IS 'Workflow state: onboard_pending (no profile), profile_complete (profile done), week_active (actively participating), study_complete (finished)';
COMMENT ON COLUMN profiles.current_week IS 'Current week number in the study (1-based, null if not started)';








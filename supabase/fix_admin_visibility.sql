-- Fix Admin Visibility Policies
-- This script restores Admin access to view all profiles, feedback, and uploads.
-- It uses the `is_admin` column on the `profiles` table to verify admin status.

-- 1. PROFILES: Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 2. FEEDBACK: Allow admins to view all feedback
DROP POLICY IF EXISTS "Admins can view all focus group feedback" ON focus_group_feedback;

CREATE POLICY "Admins can view all focus group feedback"
ON focus_group_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 3. UPLOADS: Allow admins to view all uploads
DROP POLICY IF EXISTS "Admins can view all focus group uploads" ON focus_group_uploads;

CREATE POLICY "Admins can view all focus group uploads"
ON focus_group_uploads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 4. UPLOADS: Allow admins to update verified status
DROP POLICY IF EXISTS "Admins can update focus group uploads" ON focus_group_uploads;

CREATE POLICY "Admins can update focus group uploads"
ON focus_group_uploads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);




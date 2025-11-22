-- Fix Focus Group RLS Policies: Remove auth.users queries that cause permission errors
-- Run this in Supabase SQL Editor to fix the "permission denied for table users" error
-- 
-- This script removes the problematic admin policies that query auth.users directly,
-- which causes permission errors when using the anon key.

-- Drop the problematic admin policies that query auth.users
DROP POLICY IF EXISTS "Admins can view all focus group feedback" ON focus_group_feedback;
DROP POLICY IF EXISTS "Admins can view all focus group uploads" ON focus_group_uploads;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- The user policies remain intact and will work correctly:
-- - Users can view own focus group feedback (via profile relationship)
-- - Users can insert own focus group feedback
-- - Users can update own focus group feedback
-- - Users can view own focus group uploads (via profile relationship)
-- - Users can insert own focus group uploads
-- - Users can delete own focus group uploads

-- Note: If you need admin access later, you can:
-- 1. Create a SECURITY DEFINER function to check admin status
-- 2. Or add an is_admin column to the profiles table
-- 3. Then recreate the admin policies using those methods

-- This fix will immediately resolve the "permission denied for table users" error
-- and allow users to access their own feedback and uploads.

-- Quick Fix: Remove Admin Policies That Cause "permission denied for table users" Error
-- Run this in Supabase SQL Editor to fix the error immediately

-- Drop the problematic admin policies that query auth.users
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all images" ON images;

-- That's it! The user policies remain intact and will work correctly.
-- Users can still access their own profiles, feedback, and images.


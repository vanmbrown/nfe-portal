-- Fix RLS Policies: Remove auth.users queries that cause permission errors
-- Run this in Supabase SQL Editor to fix the "permission denied for table users" error

-- Drop the problematic admin policies that query auth.users
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all images" ON images;

-- Recreate admin policies without querying auth.users
-- For now, we'll use a simpler approach - you can add admin logic later if needed

-- Option 1: Remove admin policies entirely (users can only see their own data)
-- This is the simplest and most secure approach

-- Option 2: Create a function that checks admin status (if you need admin access)
-- This requires creating a function with SECURITY DEFINER

-- For now, let's use Option 1 - remove admin policies
-- If you need admin access later, we can add it back with a proper function

-- The existing user policies are sufficient:
-- - Users can view own profile
-- - Users can insert own profile  
-- - Users can update own profile
-- - Users can view own feedback
-- - Users can insert own feedback
-- - Users can update own feedback
-- - Users can view own images
-- - Users can insert own images
-- - Users can delete own images

-- If you need admin access, create a function like this:
/*
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  -- You can implement this based on your needs
  -- For example, check a custom user metadata field
  RETURN false; -- Default to false for now
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then use it in policies:
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());
*/

-- For now, just removing the problematic policies is enough
-- This will fix the "permission denied for table users" error


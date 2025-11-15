-- Fix RLS Policies Script
-- Run this in Supabase SQL Editor to ensure RLS is properly configured
-- 
-- IMPORTANT: If you have duplicate policies, run cleanup-duplicate-policies.sql FIRST
--
-- This script will:
-- 1. Enable RLS on all tables
-- 2. Drop existing policies (to avoid conflicts)
-- 3. Create correct policies

-- ============================================
-- Step 1: Enable RLS on all tables
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 2: Drop existing policies (if any)
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can delete own feedback" ON feedback;

DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can insert own images" ON images;
DROP POLICY IF EXISTS "Users can update own images" ON images;
DROP POLICY IF EXISTS "Users can delete own images" ON images;

-- ============================================
-- Step 3: Create Profiles Policies
-- ============================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: No DELETE policy for profiles (users cannot delete their profile)

-- ============================================
-- Step 4: Create Feedback Policies
-- ============================================
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: No DELETE policy for feedback (users cannot delete feedback)

-- ============================================
-- Step 5: Create Images Policies
-- ============================================
CREATE POLICY "Users can view own images"
  ON images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON images FOR DELETE
  USING (auth.uid() = user_id);

-- Note: No UPDATE policy for images (users cannot update image metadata)

-- ============================================
-- Verification Queries (run separately)
-- ============================================
-- Check if RLS is enabled:
-- SELECT tablename, relrowsecurity 
-- FROM pg_tables t
-- JOIN pg_class c ON c.relname = t.tablename
-- WHERE schemaname = 'public' AND tablename IN ('profiles', 'feedback', 'images');

-- Check policies:
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'feedback', 'images')
-- ORDER BY tablename, policyname;


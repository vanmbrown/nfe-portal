-- Cleanup Duplicate RLS Policies
-- This script removes duplicate policies and keeps only the properly named ones
-- Run this in Supabase SQL Editor BEFORE running fix-rls-policies.sql

-- ============================================
-- Step 1: Remove duplicate policies on profiles
-- ============================================
-- Keep: "Users can view own profile", "Users can insert own profile", "Users can update own profile"
-- Remove: All other duplicate policies

DROP POLICY IF EXISTS "Enable profile insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable profile update for user" ON profiles;
DROP POLICY IF EXISTS "profile_owner_can_insert" ON profiles;
DROP POLICY IF EXISTS "profile_owner_can_select" ON profiles;
DROP POLICY IF EXISTS "profile_owner_can_update" ON profiles;
DROP POLICY IF EXISTS "profiles_ins" ON profiles;
DROP POLICY IF EXISTS "profiles_sel" ON profiles;
DROP POLICY IF EXISTS "profiles_upd" ON profiles;

-- ============================================
-- Step 2: Remove duplicate policies on feedback
-- ============================================
-- Keep: "Users can view own feedback", "Users can insert own feedback", "Users can update own feedback"
-- Remove: "feedback_owner" (ALL policy - redundant)

DROP POLICY IF EXISTS "feedback_owner" ON feedback;

-- ============================================
-- Step 3: Verify remaining policies
-- ============================================
-- After cleanup, you should have:
-- profiles: 3 policies (SELECT, INSERT, UPDATE)
-- feedback: 3 policies (SELECT, INSERT, UPDATE)
-- images: 3 policies (SELECT, INSERT, DELETE)

-- Run this query to verify:
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'feedback', 'images')
-- ORDER BY tablename, cmd;

-- ============================================
-- Step 4: After cleanup, run fix-rls-policies.sql
-- ============================================
-- This will ensure all policies are correctly configured





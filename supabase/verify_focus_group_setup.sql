-- NFE Focus Group Portal - Complete Setup Verification Query
-- Run this in Supabase SQL Editor to verify all migrations are complete
-- Expected: All checks should return rows (indicating success)

-- ============================================================================
-- 1. VERIFY TABLES EXIST
-- ============================================================================
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages')
ORDER BY table_name;

-- ============================================================================
-- 2. VERIFY COLUMNS IN PROFILES TABLE
-- ============================================================================
SELECT 
  'Profiles Columns Check' as check_type,
  column_name,
  CASE 
    WHEN column_name IN ('status', 'current_week') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name IN ('status', 'current_week')
ORDER BY column_name;

-- ============================================================================
-- 3. VERIFY INDEXES EXIST
-- ============================================================================
SELECT 
  'Indexes Check' as check_type,
  indexname as index_name,
  tablename as table_name,
  '✅ EXISTS' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (
  -- Status/Week indexes
  indexname IN ('idx_profiles_status', 'idx_profiles_current_week')
  OR
  -- Feedback indexes
  (tablename = 'focus_group_feedback' AND indexname LIKE 'idx_focus_group_feedback%')
  OR
  -- Uploads indexes
  (tablename = 'focus_group_uploads' AND indexname LIKE 'idx_focus_group_uploads%')
  OR
  -- Messages indexes
  (tablename = 'focus_group_messages' AND indexname LIKE 'idx_focus_group_messages%')
)
ORDER BY tablename, indexname;

-- ============================================================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================================================
SELECT 
  'RLS Check' as check_type,
  schemaname || '.' || tablename as table_name,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages')
ORDER BY tablename;

-- ============================================================================
-- 5. VERIFY RLS POLICIES EXIST
-- ============================================================================
SELECT 
  'RLS Policies Check' as check_type,
  tablename as table_name,
  policyname as policy_name,
  '✅ EXISTS' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages')
ORDER BY tablename, policyname;

-- ============================================================================
-- 6. EXPECTED POLICIES CHECKLIST
-- ============================================================================
-- This query shows which policies SHOULD exist vs which DO exist
SELECT 
  'Policy Verification' as check_type,
  expected.tablename,
  expected.policyname,
  CASE 
    WHEN actual.policyname IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES
    ('focus_group_feedback', 'Users can view own focus group feedback'),
    ('focus_group_feedback', 'Users can insert own focus group feedback'),
    ('focus_group_feedback', 'Users can update own focus group feedback'),
    ('focus_group_feedback', 'Admins can view all focus group feedback'),
    ('focus_group_uploads', 'Users can view own focus group uploads'),
    ('focus_group_uploads', 'Users can insert own focus group uploads'),
    ('focus_group_uploads', 'Users can delete own focus group uploads'),
    ('focus_group_uploads', 'Admins can view all focus group uploads'),
    ('focus_group_messages', 'Users can view own messages'),
    ('focus_group_messages', 'Users can send messages'),
    ('focus_group_messages', 'Users can update received messages'),
    ('focus_group_messages', 'Admins can view all messages')
) AS expected(tablename, policyname)
LEFT JOIN pg_policies actual 
  ON actual.schemaname = 'public' 
  AND actual.tablename = expected.tablename 
  AND actual.policyname = expected.policyname
ORDER BY expected.tablename, expected.policyname;

-- ============================================================================
-- 7. SUMMARY REPORT
-- ============================================================================
SELECT 
  'SUMMARY' as report_section,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages')) as tables_found,
  3 as tables_expected,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name IN ('status', 'current_week')) as columns_found,
  2 as columns_expected,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages') AND rowsecurity = true) as rls_enabled_tables,
  3 as rls_expected,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages')) as policies_found,
  12 as policies_expected;

-- ============================================================================
-- 8. QUICK PASS/FAIL CHECK
-- ============================================================================
SELECT 
  CASE 
    WHEN 
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages')) = 3
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name IN ('status', 'current_week')) = 2
      AND (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages') AND rowsecurity = true) = 3
      AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages')) >= 12
    THEN '✅ ALL CHECKS PASSED - Setup is complete!'
    ELSE '❌ SOME CHECKS FAILED - Review the detailed results above'
  END as overall_status;


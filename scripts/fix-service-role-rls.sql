-- Fix Service Role RLS Bypass Issue
-- This script helps diagnose and fix the service role RLS bypass issue

-- Check current RLS status
SELECT 
    tablename,
    relrowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'feedback', 'images');

-- Verify service role exists and has correct permissions
-- Note: service_role is a reserved role and already has BYPASSRLS by default
-- You cannot modify it, but it should already bypass RLS automatically
SELECT 
    rolname,
    rolsuper,
    rolbypassrls
FROM pg_roles
WHERE rolname = 'service_role';

-- Note: service_role already has BYPASSRLS enabled by default in Supabase
-- If service role key is not bypassing RLS, the issue is likely:
-- 1. Wrong key being used (using anon key instead of service role key)
-- 2. Client configuration issue
-- 3. The helper functions below will work around this issue

-- Alternative: Create a function that bypasses RLS for admin operations
-- This can be used by the test script if service role key doesn't work

-- Drop existing functions if they exist (to allow parameter name changes)
DROP FUNCTION IF EXISTS admin_insert_profile(UUID, TEXT, TEXT[]);
DROP FUNCTION IF EXISTS admin_insert_feedback(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT);
DROP FUNCTION IF EXISTS admin_insert_feedback(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT); -- Old version with week_number
DROP FUNCTION IF EXISTS admin_insert_image(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION admin_insert_profile(
    p_user_id UUID,
    p_age_range TEXT DEFAULT NULL,
    p_top_concerns TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    -- Delete existing profile if any
    DELETE FROM profiles WHERE user_id = p_user_id;
    
    -- Insert new profile
    INSERT INTO profiles (user_id, age_range, top_concerns)
    VALUES (p_user_id, p_age_range, p_top_concerns)
    RETURNING id INTO v_profile_id;
    
    RETURN v_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_insert_feedback(
    p_user_id UUID,
    p_week INTEGER,
    p_hydration_rating INTEGER,
    p_tone_rating INTEGER,
    p_texture_rating INTEGER,
    p_overall_rating INTEGER,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_feedback_id UUID;
BEGIN
    -- Delete existing feedback if any
    DELETE FROM feedback WHERE user_id = p_user_id AND week = p_week;
    
    -- Insert new feedback (using 'week' column, not 'week_number')
    INSERT INTO feedback (
        user_id, week, 
        hydration_rating, tone_rating, texture_rating, overall_rating, notes
    )
    VALUES (
        p_user_id, p_week,
        p_hydration_rating, p_tone_rating, p_texture_rating, p_overall_rating, p_notes
    )
    RETURNING id INTO v_feedback_id;
    
    RETURN v_feedback_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_insert_image(
    p_user_id UUID,
    p_type TEXT,
    p_filename TEXT,
    p_url TEXT,
    p_mime_type TEXT,
    p_size INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_image_id UUID;
BEGIN
    -- Delete existing image if any
    DELETE FROM images WHERE user_id = p_user_id AND filename = p_filename;
    
    -- Insert new image
    INSERT INTO images (user_id, type, filename, url, mime_type, size)
    VALUES (p_user_id, p_type, p_filename, p_url, p_mime_type, p_size)
    RETURNING id INTO v_image_id;
    
    RETURN v_image_id;
END;
$$;

-- Grant execute permissions to authenticated users (or service_role)
GRANT EXECUTE ON FUNCTION admin_insert_profile TO service_role;
GRANT EXECUTE ON FUNCTION admin_insert_feedback TO service_role;
GRANT EXECUTE ON FUNCTION admin_insert_image TO service_role;


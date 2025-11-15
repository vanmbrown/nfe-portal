-- Add the Final 9 Missing Columns
-- Based on your current 49 columns, these are the missing ones
-- Run this in Supabase SQL Editor

-- The 9 missing columns are likely these (checking against expected 58):
-- Let's add them one by one with explicit checks

DO $$ 
BEGIN
  -- Check and add missing columns individually
  -- This ensures each column is added properly
  
  -- Column 1: (Check which one is missing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'missing_col_1') THEN
    -- We'll identify this after running the diagnostic
    NULL;
  END IF;
END $$;

-- First, let's identify which 9 are actually missing
-- Run this diagnostic query first:

WITH expected_columns AS (
  SELECT unnest(ARRAY[
    'id', 'user_id', 'age_range', 'fitzpatrick_skin_tone', 'top_concerns', 
    'lifestyle', 'image_consent', 'marketing_consent', 'created_at', 'updated_at',
    'gender_identity', 'ethnic_background', 'skin_type', 'climate_exposure', 
    'uv_exposure', 'sleep_quality', 'stress_level',
    'current_routine', 'routine_frequency', 'known_sensitivities', 
    'product_use_history', 'ideal_routine', 'ideal_product', 'routine_placement_insight',
    'avg_spend_per_item', 'annual_skincare_spend', 'max_spend_motivation', 
    'value_stickiness', 'pricing_threshold_proof', 'category_premium_insight',
    'unmet_need', 'money_spent_trying', 'performance_expectation', 'drop_off_reason',
    'elixir_association', 'elixir_ideal_user', 'favorite_brand', 'favorite_brand_reason',
    'specific_pain_point', 'ingredient_awareness',
    'research_effort_score', 'influence_count', 'brand_switch_influence',
    'data_use_consent',
    'cohort_name', 'participation_status', 'uploads_count', 'last_submission', 'has_follow_up_survey'
  ]) AS column_name
),
actual_columns AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
)
SELECT 
  e.column_name AS missing_column
FROM expected_columns e
LEFT JOIN actual_columns a ON e.column_name = a.column_name
WHERE a.column_name IS NULL
ORDER BY e.column_name;


-- Verify Column Count and Find Missing Ones
-- This will show you exactly which columns are missing from the expected 58

WITH expected_columns AS (
  SELECT unnest(ARRAY[
    -- Base schema (10)
    'id', 'user_id', 'age_range', 'fitzpatrick_skin_tone', 'top_concerns', 
    'lifestyle', 'image_consent', 'marketing_consent', 'created_at', 'updated_at',
    -- Foundational (7)
    'gender_identity', 'ethnic_background', 'skin_type', 'climate_exposure', 
    'uv_exposure', 'sleep_quality', 'stress_level',
    -- Routine & ritual (7)
    'current_routine', 'routine_frequency', 'known_sensitivities', 
    'product_use_history', 'ideal_routine', 'ideal_product', 'routine_placement_insight',
    -- Financial (6)
    'avg_spend_per_item', 'annual_skincare_spend', 'max_spend_motivation', 
    'value_stickiness', 'pricing_threshold_proof', 'category_premium_insight',
    -- Problem validation (4)
    'unmet_need', 'money_spent_trying', 'performance_expectation', 'drop_off_reason',
    -- Language & identity (4)
    'elixir_association', 'elixir_ideal_user', 'favorite_brand', 'favorite_brand_reason',
    -- Pain point & ingredient (2)
    'specific_pain_point', 'ingredient_awareness',
    -- Influence & advocacy (3)
    'research_effort_score', 'influence_count', 'brand_switch_influence',
    -- Additional consent (1)
    'data_use_consent',
    -- Cohort metadata (5)
    'cohort_name', 'participation_status', 'uploads_count', 'last_submission', 'has_follow_up_survey'
  ]) AS column_name
),
actual_columns AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
)
SELECT 
  e.column_name AS expected_column,
  CASE 
    WHEN a.column_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
FROM expected_columns e
LEFT JOIN actual_columns a ON e.column_name = a.column_name
ORDER BY 
  CASE WHEN a.column_name IS NULL THEN 0 ELSE 1 END,
  e.column_name;


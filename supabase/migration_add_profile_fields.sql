-- Migration: Add comprehensive profile fields for focus group research
-- Execute this in Supabase SQL Editor after the base schema

-- Add new demographic and foundational fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender_identity TEXT,
ADD COLUMN IF NOT EXISTS ethnic_background TEXT,
ADD COLUMN IF NOT EXISTS skin_type TEXT CHECK (skin_type IN ('Dry', 'Oily', 'Combination', 'Normal', 'Sensitive')),
ADD COLUMN IF NOT EXISTS climate_exposure TEXT,
ADD COLUMN IF NOT EXISTS uv_exposure TEXT,
ADD COLUMN IF NOT EXISTS sleep_quality TEXT,
ADD COLUMN IF NOT EXISTS stress_level TEXT;

-- Add routine and ritual fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_routine TEXT,
ADD COLUMN IF NOT EXISTS routine_frequency TEXT,
ADD COLUMN IF NOT EXISTS known_sensitivities TEXT,
ADD COLUMN IF NOT EXISTS product_use_history TEXT,
ADD COLUMN IF NOT EXISTS ideal_routine TEXT,
ADD COLUMN IF NOT EXISTS ideal_product TEXT,
ADD COLUMN IF NOT EXISTS routine_placement_insight TEXT;

-- Add financial commitment fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avg_spend_per_item NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS annual_skincare_spend NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS max_spend_motivation TEXT,
ADD COLUMN IF NOT EXISTS value_stickiness TEXT,
ADD COLUMN IF NOT EXISTS pricing_threshold_proof TEXT,
ADD COLUMN IF NOT EXISTS category_premium_insight TEXT;

-- Add problem validation fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS unmet_need TEXT,
ADD COLUMN IF NOT EXISTS money_spent_trying TEXT,
ADD COLUMN IF NOT EXISTS performance_expectation TEXT,
ADD COLUMN IF NOT EXISTS drop_off_reason TEXT;

-- Add language and identity fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS elixir_association TEXT,
ADD COLUMN IF NOT EXISTS elixir_ideal_user TEXT,
ADD COLUMN IF NOT EXISTS favorite_brand TEXT,
ADD COLUMN IF NOT EXISTS favorite_brand_reason TEXT;

-- Add pain point and ingredient sophistication fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS specific_pain_point TEXT,
ADD COLUMN IF NOT EXISTS ingredient_awareness TEXT;

-- Add influence and advocacy fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS research_effort_score INTEGER CHECK (research_effort_score BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS influence_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS brand_switch_influence BOOLEAN;

-- Add additional consent field
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS data_use_consent BOOLEAN DEFAULT false;

-- Add optional cohort metadata fields (for admin use)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cohort_name TEXT,
ADD COLUMN IF NOT EXISTS participation_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS uploads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_submission TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_follow_up_survey BOOLEAN DEFAULT false;

-- Create indexes for new fields that might be queried
CREATE INDEX IF NOT EXISTS idx_profiles_skin_type ON profiles(skin_type);
CREATE INDEX IF NOT EXISTS idx_profiles_cohort_name ON profiles(cohort_name);
CREATE INDEX IF NOT EXISTS idx_profiles_participation_status ON profiles(participation_status);









-- Verify Feedback Table Schema
-- Run this in Supabase SQL Editor to check if feedback table has correct columns

-- Check if feedback table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'feedback'
ORDER BY ordinal_position;

-- If hydration_rating is missing, you'll need to add it:
-- ALTER TABLE feedback ADD COLUMN IF NOT EXISTS hydration_rating INTEGER NOT NULL CHECK (hydration_rating BETWEEN 1 AND 5) DEFAULT 3;
-- ALTER TABLE feedback ADD COLUMN IF NOT EXISTS tone_rating INTEGER NOT NULL CHECK (tone_rating BETWEEN 1 AND 5) DEFAULT 3;
-- ALTER TABLE feedback ADD COLUMN IF NOT EXISTS texture_rating INTEGER NOT NULL CHECK (texture_rating BETWEEN 1 AND 5) DEFAULT 3;
-- ALTER TABLE feedback ADD COLUMN IF NOT EXISTS overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5) DEFAULT 3;





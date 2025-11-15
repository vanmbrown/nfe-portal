-- Fix Feedback Table Schema
-- Run this in Supabase SQL Editor to ensure feedback table has all required columns

-- First, check what columns currently exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'feedback'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
-- These match the schema in supabase/schema.sql

-- Add hydration_rating if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'feedback' 
        AND column_name = 'hydration_rating'
    ) THEN
        ALTER TABLE feedback 
        ADD COLUMN hydration_rating INTEGER NOT NULL 
        CHECK (hydration_rating BETWEEN 1 AND 5) DEFAULT 3;
    END IF;
END $$;

-- Add tone_rating if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'feedback' 
        AND column_name = 'tone_rating'
    ) THEN
        ALTER TABLE feedback 
        ADD COLUMN tone_rating INTEGER NOT NULL 
        CHECK (tone_rating BETWEEN 1 AND 5) DEFAULT 3;
    END IF;
END $$;

-- Add texture_rating if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'feedback' 
        AND column_name = 'texture_rating'
    ) THEN
        ALTER TABLE feedback 
        ADD COLUMN texture_rating INTEGER NOT NULL 
        CHECK (texture_rating BETWEEN 1 AND 5) DEFAULT 3;
    END IF;
END $$;

-- Add overall_rating if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'feedback' 
        AND column_name = 'overall_rating'
    ) THEN
        ALTER TABLE feedback 
        ADD COLUMN overall_rating INTEGER NOT NULL 
        CHECK (overall_rating BETWEEN 1 AND 5) DEFAULT 3;
    END IF;
END $$;

-- Add notes if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'feedback' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE feedback 
        ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Verify all columns now exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'feedback'
ORDER BY ordinal_position;





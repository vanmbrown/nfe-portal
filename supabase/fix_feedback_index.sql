-- Verify and Fix Unique Index for Focus Group Feedback

-- 1. Check if the unique constraint exists (implicitly via index)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'focus_group_feedback_profile_id_week_number_key'
    ) THEN
        -- If not exists, try to add it. 
        -- Note: This might fail if duplicates already exist. We might need to clean them up first.
        ALTER TABLE focus_group_feedback
        ADD CONSTRAINT focus_group_feedback_profile_id_week_number_key 
        UNIQUE (profile_id, week_number);
    END IF;
END
$$;

-- 2. Alternatively, ensure the index exists directly (Supabase sometimes uses indexes without explicit constraints)
CREATE UNIQUE INDEX IF NOT EXISTS idx_focus_group_feedback_unique_week 
ON focus_group_feedback (profile_id, week_number);




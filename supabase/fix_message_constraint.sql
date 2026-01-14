-- Fix Focus Group Messages Constraint
-- This ensures the check constraint allows 'admin' and 'user' values

DO $$
BEGIN
    -- Drop the constraint if it exists (to allow recreating it with correct values)
    ALTER TABLE focus_group_messages DROP CONSTRAINT IF EXISTS focus_group_messages_sender_role_check;
    
    -- Add the constraint back with confirmed values
    ALTER TABLE focus_group_messages 
    ADD CONSTRAINT focus_group_messages_sender_role_check 
    CHECK (sender_role IN ('admin', 'user'));
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating constraint: %', SQLERRM;
END
$$;




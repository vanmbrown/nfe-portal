-- Fix RLS policies for focus_group_messages

-- Enable RLS
ALTER TABLE focus_group_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view their own messages" ON focus_group_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON focus_group_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON focus_group_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON focus_group_messages;

-- 1. Users can view messages where they are the sender OR recipient
CREATE POLICY "Users can view their own messages"
ON focus_group_messages FOR SELECT
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id
);

-- 2. Users can insert messages where they are the sender
CREATE POLICY "Users can insert their own messages"
ON focus_group_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
);

-- 3. Admins can view all messages (if they have is_admin = true in profiles)
CREATE POLICY "Admins can view all messages"
ON focus_group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 4. Admins can insert messages (as themselves, sender_id must match auth.uid)
-- Note: The previous insert policy "Users can insert their own messages" actually covers admins too,
-- since admins are also users inserting with their own auth.uid().
-- But we can add a specific one if we want to be explicit or if the user policy has other restrictions.
-- For now, the user policy is sufficient: auth.uid() = sender_id.

-- Grant access to authenticated users
GRANT ALL ON focus_group_messages TO authenticated;




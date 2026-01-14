-- Migration: Create focus_group_messages table if it doesn't exist
-- Purpose: Support messaging between participants and admins
-- Rollback: DROP TABLE IF EXISTS focus_group_messages;

-- Create focus_group_messages table
CREATE TABLE IF NOT EXISTS focus_group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'user')),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  conversation_id UUID, -- Optional: for grouping messages in threads
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_group_messages_sender_id ON focus_group_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_focus_group_messages_recipient_id ON focus_group_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_focus_group_messages_sender_role ON focus_group_messages(sender_role);
CREATE INDEX IF NOT EXISTS idx_focus_group_messages_is_read ON focus_group_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_focus_group_messages_created_at ON focus_group_messages(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on the table
ALTER TABLE focus_group_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Users can view own messages" ON focus_group_messages;
DROP POLICY IF EXISTS "Users can send messages" ON focus_group_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON focus_group_messages;

-- Users can view messages where they are sender or recipient
CREATE POLICY "Users can view own messages"
  ON focus_group_messages FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Users can insert messages (as sender)
CREATE POLICY "Users can send messages"
  ON focus_group_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

-- Users can update messages they received (to mark as read)
CREATE POLICY "Users can update received messages"
  ON focus_group_messages FOR UPDATE
  USING (
    recipient_id = auth.uid()
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON focus_group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment for documentation
COMMENT ON TABLE focus_group_messages IS 'Messages between focus group participants and admins';
COMMENT ON COLUMN focus_group_messages.sender_id IS 'User ID of the message sender';
COMMENT ON COLUMN focus_group_messages.recipient_id IS 'User ID of the message recipient';
COMMENT ON COLUMN focus_group_messages.sender_role IS 'Role of sender: admin or user';
COMMENT ON COLUMN focus_group_messages.message_text IS 'The message content';
COMMENT ON COLUMN focus_group_messages.is_read IS 'Whether the message has been read by the recipient';


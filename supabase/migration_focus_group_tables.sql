-- NFE Focus Group Portal - Weekly Feedback & Upload Tables
-- Execute this in Supabase SQL Editor after the base schema

-- Focus Group Feedback table
CREATE TABLE IF NOT EXISTS focus_group_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
  feedback_date TIMESTAMPTZ DEFAULT NOW(),
  product_usage TEXT,
  perceived_changes TEXT,
  concerns_or_issues TEXT,
  emotional_response TEXT,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
  next_week_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, week_number)
);

-- Focus Group Uploads table
CREATE TABLE IF NOT EXISTS focus_group_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
  image_url TEXT NOT NULL,
  notes TEXT,
  consent_given BOOLEAN DEFAULT false,
  verified_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_group_feedback_profile_id ON focus_group_feedback(profile_id);
CREATE INDEX IF NOT EXISTS idx_focus_group_feedback_week_number ON focus_group_feedback(week_number);
CREATE INDEX IF NOT EXISTS idx_focus_group_feedback_created_at ON focus_group_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_focus_group_uploads_profile_id ON focus_group_uploads(profile_id);
CREATE INDEX IF NOT EXISTS idx_focus_group_uploads_week_number ON focus_group_uploads(week_number);
CREATE INDEX IF NOT EXISTS idx_focus_group_uploads_created_at ON focus_group_uploads(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on both tables
ALTER TABLE focus_group_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_group_uploads ENABLE ROW LEVEL SECURITY;

-- Focus Group Feedback policies
-- Users can read and write their own feedback (via profile relationship)
CREATE POLICY "Users can view own focus group feedback"
  ON focus_group_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = focus_group_feedback.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own focus group feedback"
  ON focus_group_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = focus_group_feedback.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own focus group feedback"
  ON focus_group_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = focus_group_feedback.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can view all feedback
CREATE POLICY "Admins can view all focus group feedback"
  ON focus_group_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- Focus Group Uploads policies
-- Users can read and write their own uploads (via profile relationship)
CREATE POLICY "Users can view own focus group uploads"
  ON focus_group_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = focus_group_uploads.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own focus group uploads"
  ON focus_group_uploads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = focus_group_uploads.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own focus group uploads"
  ON focus_group_uploads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = focus_group_uploads.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can view all uploads
CREATE POLICY "Admins can view all focus group uploads"
  ON focus_group_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );









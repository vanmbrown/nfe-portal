# Focus Group Tables Migration Guide

## Overview

This guide walks you through executing the database migration for the Focus Group Weekly Feedback and Upload features.

## Prerequisites

- Supabase project created and configured
- Base schema executed (`supabase/schema.sql`)
- Access to Supabase SQL Editor

## Step 1: Execute Migration SQL

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"** button
4. Open `supabase/migration_focus_group_tables.sql` from your project
5. Copy the **entire file contents** (Ctrl+A, Ctrl+C)
6. Paste into the Supabase SQL Editor
7. Click **"Run"** button (or press Ctrl+Enter)
8. You should see: **"Success. No rows returned"**

## Step 2: Verify Tables Created

1. In Supabase dashboard, click **Table Editor** (left sidebar)
2. You should now see these new tables:
   - ✅ `focus_group_feedback`
   - ✅ `focus_group_uploads`

## Step 3: Verify RLS Policies

1. In Supabase: **Table Editor**
2. Click on the `focus_group_feedback` table
3. Click the **"Policies"** tab
4. You should see policies:
   - "Users can view own focus group feedback"
   - "Users can insert own focus group feedback"
   - "Users can update own focus group feedback"
   - "Admins can view all focus group feedback"

5. Repeat for `focus_group_uploads` table:
   - "Users can view own focus group uploads"
   - "Users can insert own focus group uploads"
   - "Users can delete own focus group uploads"
   - "Admins can view all focus group uploads"

## Step 4: Verify Indexes

1. In Supabase: **Table Editor** → `focus_group_feedback`
2. Check that indexes exist on:
   - `profile_id`
   - `week_number`
   - `created_at`

3. Repeat for `focus_group_uploads` table

## Step 5: Test Data Insertion

You can test with a sample query (replace with actual profile_id):

```sql
-- Get a test profile_id
SELECT id, user_id FROM profiles LIMIT 1;

-- Test feedback insert (replace {profile_id} with actual ID)
INSERT INTO focus_group_feedback (
  profile_id,
  week_number,
  product_usage,
  overall_rating
) VALUES (
  '{profile_id}'::uuid,
  1,
  'Test usage',
  8
);

-- Verify it was inserted
SELECT * FROM focus_group_feedback WHERE profile_id = '{profile_id}'::uuid;
```

## Troubleshooting

### "relation already exists"

- Tables already exist - that's fine! The migration uses `IF NOT EXISTS`
- Just verify the structure matches the schema

### "permission denied"

- Make sure you're using the SQL Editor (not trying to run via API)
- The SQL Editor has full permissions

### "syntax error"

- Make sure you copied the ENTIRE file
- Check for any missing semicolons
- Verify you're using PostgreSQL syntax

### "foreign key constraint violation"

- Ensure the `profiles` table exists and has data
- Verify the profile_id you're using exists in the profiles table

## Next Steps

After migration is complete:

1. ✅ Create storage bucket (see `docs/SETUP_FOCUS_GROUP_STORAGE.md`)
2. ✅ Test feedback submission via `/focus-group/feedback`
3. ✅ Test image upload via `/focus-group/upload`
4. ✅ Verify data appears in Supabase tables
5. ✅ Test RLS policies by logging in as different users

## Rollback (if needed)

If you need to remove these tables:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS focus_group_uploads CASCADE;
DROP TABLE IF EXISTS focus_group_feedback CASCADE;
```

**Note**: This will also delete all related data. Only use if you're sure you want to remove everything.









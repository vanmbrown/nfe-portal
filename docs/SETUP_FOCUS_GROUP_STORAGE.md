# Focus Group Storage Bucket Setup Guide

## Overview

This guide walks you through setting up the `focus-group-uploads` storage bucket in Supabase for secure image uploads.

## Prerequisites

- Supabase project created and configured
- Database schema migration executed (`supabase/migration_focus_group_tables.sql`)
- Environment variables set in `.env.local`

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** button
4. Configure the bucket:
   - **Name**: `focus-group-uploads`
   - **Public bucket**: ❌ **Unchecked** (Private bucket)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp` (optional, for extra security)
5. Click **"Create bucket"**

## Step 2: Create Storage Policies

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on the focus-group-uploads bucket
-- (This should be automatic, but verify in Storage → Policies)

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload to own focus group folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = (
    SELECT profiles.id::text
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Policy: Users can read their own images
CREATE POLICY "Users can read own focus group images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = (
    SELECT profiles.id::text
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own focus group images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = (
    SELECT profiles.id::text
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Policy: Admins can read all images
CREATE POLICY "Admins can read all focus group images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'focus-group-uploads' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
  )
);
```

## Step 3: Verify File Path Structure

Files will be stored with the following structure:
```
focus-group-uploads/
  {profile_id}/
    week-{week_number}-{timestamp}.jpg
    week-{week_number}-{timestamp}.png
    ...
```

Example:
```
focus-group-uploads/
  a1b2c3d4-e5f6-7890-abcd-ef1234567890/
    week-1-1704067200000.jpg
    week-1-1704067201000.png
    week-2-1704672000000.jpg
```

## Step 4: Test Upload

1. Log in to the focus group portal
2. Navigate to `/focus-group/upload`
3. Upload a test image
4. Verify the file appears in Supabase Storage under the correct folder
5. Verify the file record appears in the `focus_group_uploads` table

## Troubleshooting

### "Bucket not found" Error

- Verify the bucket name is exactly `focus-group-uploads` (case-sensitive)
- Check that the bucket was created successfully in Storage dashboard

### "Permission denied" Error

- Verify RLS policies are created and active
- Check that the user has a profile in the `profiles` table
- Verify the folder name matches the profile ID

### Signed URLs Not Working

- Ensure the bucket is private (not public)
- Check that `getSignedUrl` function is using the correct path format
- Verify the signed URL expiry time (default: 1 hour)

### Files Not Appearing in Gallery

- Check browser console for errors
- Verify API route `/api/focus-group/uploads` returns data
- Check that signed URLs are being generated correctly
- Verify the `focus_group_uploads` table has records

## Security Notes

- All images are stored privately (no public access)
- Users can only access their own images (via RLS policies)
- Signed URLs expire after 1 hour (configurable in code)
- File size is limited to 5MB per file (configurable)
- Only image files are accepted (MIME type validation)

## Maintenance

### Cleanup Old Files

To remove files older than 2 years:

```sql
-- This would need to be run periodically
-- Check focus_group_uploads table for old records
-- Delete corresponding files from storage
```

### Monitor Storage Usage

- Check Storage dashboard for bucket size
- Monitor upload counts in `focus_group_uploads` table
- Set up alerts for storage quota limits









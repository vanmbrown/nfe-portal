-- Admin Storage Policy for focus-group-uploads bucket
-- Run this in Supabase SQL Editor
-- 
-- This allows users with is_admin = TRUE to view all uploaded images

-- Policy: Admins can list and read all files in focus-group-uploads
DROP POLICY IF EXISTS "Allow admins to view focus group uploads" ON storage.objects;
CREATE POLICY "Allow admins to view focus group uploads"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'focus-group-uploads' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = TRUE
  )
);

-- Policy: Admins can list all folders/files
DROP POLICY IF EXISTS "Allow admins to list focus group uploads" ON storage.objects;
CREATE POLICY "Allow admins to list focus group uploads"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'focus-group-uploads' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = TRUE
  )
);

-- Note: This policy allows admins to:
-- - List all folders (user_id folders)
-- - List all files in any folder
-- - Generate signed URLs for any file
-- - View/download any image


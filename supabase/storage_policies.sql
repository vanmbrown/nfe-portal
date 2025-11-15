-- NFE Focus Group Portal - Storage Bucket Policies
-- Execute this in Supabase SQL Editor after creating the 'images' bucket

-- Note: First create the bucket in Supabase Dashboard:
-- Storage → New Bucket → Name: "images" → Public or Private (your choice)

-- Enable RLS on the images bucket
-- This is done automatically when you create the bucket, but ensure it's enabled

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own images
CREATE POLICY "Users can read own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can read all images
CREATE POLICY "Admins can read all images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
  )
);









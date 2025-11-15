-- Storage Policies for focus-group-uploads bucket
-- Run this AFTER creating the bucket in Supabase Dashboard
-- 
-- Steps:
-- 1. Go to Supabase Dashboard -> Storage
-- 2. Click "New bucket"
-- 3. Name: focus-group-uploads
-- 4. Choose Public or Private (Private recommended)
-- 5. Click "Create bucket"
-- 6. Then run this SQL script

-- Policy: Users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own images
DROP POLICY IF EXISTS "Users can read own images" ON storage.objects;
CREATE POLICY "Users can read own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


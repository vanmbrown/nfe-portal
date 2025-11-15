# Setup Storage Bucket for Focus Group Uploads

## Quick Steps

### 1. Navigate to Storage in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click **"Storage"** in the left sidebar (icon looks like a folder/box)
3. You'll see a list of existing buckets (if any)

### 2. Check if Bucket Exists

Look for a bucket named:
- **`focus-group-uploads`** (used by the upload API)

If it doesn't exist, you'll need to create it.

### 3. Create the Bucket

1. Click the **"New bucket"** button (usually top right)
2. **Bucket name:** `focus-group-uploads`
3. **Public or Private:**
   - **Public**: Images accessible via public URLs (easier, less secure)
   - **Private**: Images require signed URLs (more secure, recommended)
4. Click **"Create bucket"**

### 4. Set Up Storage Policies (If Private)

If you chose **Private**, you need to add policies so users can upload their own images.

1. Go to **SQL Editor** in Supabase
2. Run the policies from `supabase/storage_policies.sql`
3. **Important**: Update the bucket name in the policies from `'images'` to `'focus-group-uploads'`

Or run this simplified version:

```sql
-- Storage Policies for focus-group-uploads bucket
-- Users can upload to their own folder (folder name = user_id)

CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own images
CREATE POLICY "Users can read own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'focus-group-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 5. Verify Setup

1. Go back to **Storage** → **focus-group-uploads**
2. You should see the bucket with policies enabled
3. Try uploading an image from your app
4. Check the bucket - you should see a folder with your `user_id` and the uploaded file

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `focus-group-uploads` (case-sensitive)
- Check that the bucket exists in Storage section

### "Permission denied" error
- Make sure you've run the storage policies SQL
- Verify RLS (Row Level Security) is enabled on the bucket
- Check that the bucket name in policies matches exactly

### "Upload failed" error
- Check file size (max 5MB per file)
- Verify file type is an image (jpg, png, etc.)
- Check browser console for detailed error messages

## Visual Guide

```
Supabase Dashboard
├── Storage (left sidebar)
    ├── Buckets list
    │   └── focus-group-uploads ← Your bucket should be here
    ├── New bucket button
    └── Policies tab (for each bucket)
```

## Next Steps

After creating the bucket and policies:
1. Test the upload functionality in your app
2. Check that files appear in the bucket
3. Verify users can only see their own uploads


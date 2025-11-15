# Admin Uploads Viewer Setup Guide

## Overview

The Admin Uploads Viewer allows administrators to view all participant-uploaded images from the `focus-group-uploads` storage bucket, grouped by user and week.

## Setup Steps

### Step 1: Add Admin Storage Policy

Run the SQL script in Supabase SQL Editor:

**File:** `supabase/add_admin_storage_policy.sql`

```sql
-- Policy: Admins can list and read all files in focus-group-uploads
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
```

This policy allows users with `is_admin = TRUE` to:
- List all folders (user_id folders)
- List all files in any folder
- Generate signed URLs for any file
- View/download any image

### Step 2: Verify Admin Status

Ensure your profile has `is_admin = TRUE`:

1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find your profile row
3. Verify `is_admin = TRUE`
4. If not, set it to `TRUE` and save

### Step 3: Access the Uploads Viewer

1. Log in at `/focus-group/login`
2. Navigate to `/focus-group/admin`
3. Click the **"View Uploads"** button
4. Or go directly to `/focus-group/admin/uploads`

## Features

### Summary Statistics

- **Total Users:** Number of users who have uploaded images
- **Total Images:** Total number of uploaded images
- **Avg. per User:** Average images per user

### User Grouping

Images are grouped by:
- **User ID:** Each user has their own folder (folder name = `user_id`)
- **Week Number:** Extracted from filename pattern `week-{week_number}-{timestamp}.{ext}`

### Image Display

- **Thumbnails:** Grid layout with responsive columns
- **View Full Size:** Click "View" to open image in new tab
- **Download:** Click "Download" to save image locally
- **Error Handling:** Graceful fallback if image fails to load

### User Filter

- Filter by specific user (if multiple users have uploads)
- Shows user count and image count per user

## File Structure

Images are stored in Supabase Storage with this structure:

```
focus-group-uploads/
  {user_id}/
    week-1-1704067200000.jpg
    week-1-1704067201000.png
    week-2-1704672000000.jpg
    ...
```

Where:
- `{user_id}` = Auth user ID (UUID)
- `week-{number}` = Week number extracted from filename
- `{timestamp}` = Upload timestamp
- `.{ext}` = File extension (jpg, png, webp, etc.)

## Security

### Access Control

- ✅ **Authentication Required:** Must be logged in
- ✅ **Admin Only:** Checks `is_admin = TRUE` flag
- ✅ **Read-Only:** No delete or modify operations
- ✅ **Signed URLs:** Images use temporary signed URLs (1 hour expiry)

### Storage Policies

The admin storage policy allows:
- Listing all folders and files
- Generating signed URLs
- Viewing/downloading images

**Note:** The policy uses `auth.uid()` to verify admin status, so it works with the authenticated user's session.

## Troubleshooting

### "Permission denied" Error

**Cause:** Admin storage policy not created or admin flag not set.

**Solution:**
1. Run `supabase/add_admin_storage_policy.sql` in Supabase SQL Editor
2. Verify your profile has `is_admin = TRUE`
3. Clear browser cache and try again

### "No uploads found"

**Cause:** No images uploaded yet or bucket doesn't exist.

**Solution:**
1. Verify bucket `focus-group-uploads` exists in Supabase Storage
2. Check that users have uploaded images
3. Verify folder structure matches `{user_id}/` pattern

### Images Not Loading

**Cause:** Signed URL generation failed or expired.

**Solution:**
1. Check browser console for errors
2. Verify storage bucket is private (not public)
3. Check that admin policy is active
4. Try refreshing the page (signed URLs are regenerated)

### "Failed to verify admin access"

**Cause:** Admin check failed.

**Solution:**
1. Verify you're logged in
2. Check that `is_admin = TRUE` in your profile
3. Check browser console for detailed error messages

## Files Created

1. **`supabase/add_admin_storage_policy.sql`**
   - SQL script for admin storage access policy

2. **`src/lib/storage/admin-storage.ts`**
   - Helper functions for listing and grouping uploads
   - Functions:
     - `getAllFocusGroupUploads()` - Lists all files from storage
     - `groupUploadsByUser()` - Groups files by user_id
     - `extractWeekFromFilename()` - Extracts week number from filename

3. **`src/app/focus-group/admin/uploads/page.tsx`**
   - Main uploads viewer page component
   - Displays images grouped by user and week
   - Includes filtering and download functionality

4. **`src/app/focus-group/admin/page.tsx`** (Modified)
   - Added "View Uploads" button link

## Usage

### Viewing All Uploads

1. Navigate to `/focus-group/admin/uploads`
2. Browse images grouped by user
3. Each user section shows:
   - User ID (truncated)
   - Profile info (if available)
   - Images grouped by week

### Filtering by User

1. Use the "Filter by User" dropdown
2. Select a specific user
3. View only that user's images

### Viewing Full-Size Images

1. Click the **"View"** button on any thumbnail
2. Image opens in new tab
3. Signed URL valid for 1 hour

### Downloading Images

1. Click the **"Download"** button on any thumbnail
2. Image downloads to your default download folder
3. Original filename is preserved

## Performance Considerations

### Large Numbers of Images

- Currently loads up to 1000 files per folder
- Signed URLs are generated on-demand
- Consider pagination for very large datasets

### Signed URL Expiry

- URLs expire after 1 hour
- Page refresh regenerates URLs
- Consider caching for better performance

## Future Enhancements

### Potential Improvements

1. **Pagination**
   - Load images in batches
   - Infinite scroll or page navigation

2. **Search & Filter**
   - Search by filename
   - Filter by week number
   - Filter by date range

3. **Bulk Operations**
   - Download all images for a user
   - Export as ZIP file

4. **Image Metadata**
   - Show file size
   - Show upload date
   - Show image dimensions

5. **User Information**
   - Display user email/name
   - Link to user profile
   - Show user's feedback history

---

**Created:** December 2024  
**Status:** ✅ Ready for Use


# NFE Focus Group - Weekly Feedback & Upload Implementation Plan

## Overview
Implement fully functional Weekly Feedback and Upload Return modules for the Focus Group Portal, using Supabase PostgreSQL for data persistence and Supabase Storage for file handling.

## Database Schema

### 1. Create Migration SQL File
**File**: `supabase/migration_focus_group_tables.sql`

Create two new tables:
- `focus_group_feedback`: Stores weekly written feedback with holistic fields
- `focus_group_uploads`: Stores photo uploads linked to profiles and weeks

Key requirements:
- Both tables use `profile_id UUID REFERENCES profiles(id)` as foreign key
- `focus_group_feedback` includes: id, profile_id, week_number, feedback_date, product_usage, perceived_changes, concerns_or_issues, emotional_response, overall_rating (1-10), next_week_focus
- `focus_group_uploads` includes: id, profile_id, upload_date, week_number, image_url, notes, consent_given, verified_by_admin
- Add RLS policies for users to access only their own data
- Add indexes on profile_id and week_number for performance
- Add UNIQUE constraint on (profile_id, week_number) for feedback to prevent duplicates

## TypeScript Types

### 2. Update Focus Group Types
**File**: `src/types/focus-group.ts`

Add new interfaces:
```typescript
export interface FocusGroupFeedback {
  id: string
  profile_id: string
  week_number: number
  feedback_date: string
  product_usage: string | null
  perceived_changes: string | null
  concerns_or_issues: string | null
  emotional_response: string | null
  overall_rating: number | null // 1-10
  next_week_focus: string | null
  created_at: string
}

export interface FocusGroupUpload {
  id: string
  profile_id: string
  upload_date: string
  week_number: number
  image_url: string
  notes: string | null
  consent_given: boolean
  verified_by_admin: boolean
  created_at: string
}
```

## Validation Schemas

### 3. Add Zod Schemas
**File**: `src/lib/validation/schemas.ts`

Add validation schemas:
- `focusGroupFeedbackSchema`: Validates feedback form data with optional fields and overall_rating (1-10)
- `focusGroupUploadSchema`: Validates upload metadata (notes, consent_given)

## API Routes

### 4. Create Feedback API Route
**File**: `src/app/api/focus-group/feedback/route.ts`

Implement:
- **POST**: Submit weekly feedback
  - Authenticate user via Supabase session
  - Get profile_id from profiles table using user_id
  - Validate week_number (auto-calculated or provided)
  - Check for existing feedback for that week (prevent duplicates)
  - Insert into focus_group_feedback table
  - Return success/error response
  
- **GET**: Retrieve user's feedback history
  - Authenticate user
  - Get profile_id
  - Query focus_group_feedback WHERE profile_id = ...
  - Return array of feedback entries sorted by week_number

### 5. Create Uploads API Route
**File**: `src/app/api/focus-group/uploads/route.ts`

Implement:
- **POST**: Handle file upload to Supabase Storage
  - Authenticate user
  - Get profile_id from profiles table
  - Calculate week_number from profile.created_at
  - Upload file to `focus-group-uploads/{profile_id}/week-{week_number}-{timestamp}.jpg`
  - Store metadata in focus_group_uploads table
  - Return upload record with signed URL
  
- **GET**: Retrieve user's upload history
  - Authenticate user
  - Get profile_id
  - Query focus_group_uploads WHERE profile_id = ...
  - Generate signed URLs for images
  - Return array of upload records

## Helper Functions

### 6. Create Week Calculation Utility
**File**: `src/lib/focus-group/week-calculation.ts`

Function: `calculateWeekNumber(profileCreatedAt: string): number`
- Calculate weeks since profile creation
- Return week number (1-12, max)
- Handle edge cases (future dates, missing dates)

### 7. Create Supabase Storage Helper
**File**: `src/lib/storage/supabase-storage.ts`

Functions:
- `uploadToSupabaseStorage(file: File, profileId: string, weekNumber: number): Promise<string>`
- `getSignedUrl(imageUrl: string): Promise<string>`
- `deleteFromSupabaseStorage(imageUrl: string): Promise<void>`

## Frontend Components

### 8. Create FeedbackForm Component
**File**: `src/components/focus-group/FeedbackForm.tsx`

Features:
- Auto-detect week number from profile.created_at
- Fallback dropdown (Week 1-12) if calculation fails
- Form fields:
  - Week selector (read-only if auto-detected)
  - Product usage (textarea)
  - Perceived changes (textarea)
  - Concerns or issues (textarea)
  - Emotional response (textarea)
  - Overall rating (slider 1-10)
  - Next week focus (textarea)
- Submit button with loading state
- Success/error messages
- Prevent duplicate submissions for same week

### 9. Create UploadForm Component
**File**: `src/components/focus-group/UploadForm.tsx`

Features:
- File upload (1-3 images, accept="image/*")
- Drag-and-drop interface
- Image preview before upload
- Notes textarea
- Consent checkbox (required)
- Week number display (auto-calculated)
- Upload button with progress indicator
- Success confirmation

### 10. Create FileUpload Component
**File**: `src/components/ui/FileUpload.tsx`

Reusable component:
- Drag-and-drop zone
- File input with accept="image/*"
- Multiple file support (max 3)
- Image preview thumbnails
- Remove file functionality
- File size validation (max 5MB per file)
- Error handling

### 11. Create UploadGallery Component
**File**: `src/components/focus-group/UploadGallery.tsx`

Features:
- Display previous uploads grouped by week
- Show thumbnails with signed URLs
- Display notes and upload date
- Week number badges
- Empty state message

## Page Components

### 12. Update Feedback Page
**File**: `src/app/focus-group/feedback/page.tsx`

Replace placeholder with:
- Page title and description
- FeedbackForm component
- Display existing feedback entries (if any)
- Link to upload page

### 13. Update Upload Page
**File**: `src/app/focus-group/upload/page.tsx`

Replace placeholder with:
- Page title and description
- UploadForm component
- UploadGallery component showing previous uploads
- Link to feedback page

## Supabase Storage Setup

### 14. Create Storage Bucket Documentation
**File**: `docs/SETUP_FOCUS_GROUP_STORAGE.md`

Instructions for:
- Creating `focus-group-uploads` bucket in Supabase Dashboard
- Setting bucket to private
- Creating RLS policies for storage.objects:
  - Users can upload to their own folder: `{profile_id}/`
  - Users can read their own images
  - Users can delete their own images
  - Admins can read all images
- File path structure: `{profile_id}/week-{week_number}-{timestamp}.jpg`

## Database Migration Steps

### 15. Migration Execution Guide
**File**: `docs/FOCUS_GROUP_MIGRATION_GUIDE.md`

Steps:
1. Execute `supabase/migration_focus_group_tables.sql` in Supabase SQL Editor
2. Verify tables created successfully
3. Verify RLS policies are active
4. Test with sample data
5. Create storage bucket and policies

## Testing Checklist

- [ ] User can submit weekly feedback
- [ ] Week number auto-calculates correctly
- [ ] Duplicate feedback for same week is prevented
- [ ] User can upload 1-3 images
- [ ] Images stored in correct Supabase Storage path
- [ ] Upload metadata saved to database
- [ ] User can view their feedback history
- [ ] User can view their upload gallery
- [ ] Signed URLs work for private images
- [ ] RLS policies prevent cross-user access
- [ ] Form validation works correctly
- [ ] Error handling displays user-friendly messages

## Implementation Order

1. Database schema migration
2. TypeScript types and validation schemas
3. Helper functions (week calculation, storage)
4. API routes (feedback and uploads)
5. UI components (FileUpload, FeedbackForm, UploadForm, UploadGallery)
6. Page updates (feedback and upload pages)
7. Storage bucket setup and testing
8. Integration testing and bug fixes









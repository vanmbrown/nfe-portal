# NFE Focus Group Portal — Architecture & Implementation Summary

## Overview

The NFE Focus Group Portal is a secure, participant-focused platform for collecting weekly feedback, progress images, and comprehensive profile data from focus group participants. Built on Next.js 14+ App Router with Supabase PostgreSQL for data persistence and Supabase Storage for secure file handling.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Routes](#api-routes)
5. [Frontend Components](#frontend-components)
6. [File Upload & Storage](#file-upload--storage)
7. [Data Flow](#data-flow)
8. [Security Implementation](#security-implementation)
9. [Features Implemented](#features-implemented)
10. [Technical Decisions](#technical-decisions)
11. [File Structure](#file-structure)
12. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Email/Password, PKCE flow)
- **File Storage**: Supabase Storage (Private bucket)
- **Validation**: Zod schemas
- **Forms**: React Hook Form
- **UI Components**: ShadCN-based components with Tailwind CSS
- **Type Safety**: TypeScript

### Architecture Pattern

**Monolithic Application** with modular API routes:
- Single Next.js application
- Server-side API routes for data operations
- Client-side components for user interaction
- Supabase handles authentication, database, and storage

---

## Database Schema

### Core Tables

#### 1. `profiles` Table
Stores comprehensive participant profile data including demographics, routines, financial commitment, problem validation, language/identity, pain points, influence metrics, and consent flags.

**Key Fields:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `age_range`, `fitzpatrick_skin_tone`, `gender_identity`, `ethnic_background`
- `skin_type`, `top_concerns[]`, `lifestyle[]`
- `climate_exposure`, `uv_exposure`, `sleep_quality`, `stress_level`
- `current_routine`, `routine_frequency`, `known_sensitivities`
- `product_use_history`, `ideal_routine`, `ideal_product`
- `routine_placement_insight`
- `avg_spend_per_item`, `annual_skincare_spend`
- `max_spend_motivation`, `value_stickiness`, `pricing_threshold_proof`
- `category_premium_insight`
- `unmet_need`, `money_spent_trying`
- `performance_expectation`, `drop_off_reason`
- `elixir_association`, `elixir_ideal_user`
- `favorite_brand`, `favorite_brand_reason`
- `specific_pain_point`, `ingredient_awareness`
- `research_effort_score`, `influence_count`, `brand_switch_influence`
- `image_consent`, `marketing_consent`, `data_use_consent`
- `cohort_name`, `participation_status`, `uploads_count`
- `last_submission`, `has_follow_up_survey`
- `created_at`, `updated_at`

**Migration File**: `supabase/migration_add_profile_fields.sql`

#### 2. `focus_group_feedback` Table
Stores weekly written feedback submissions from participants.

**Key Fields:**
- `id` (UUID, Primary Key)
- `profile_id` (UUID, Foreign Key → profiles.id)
- `week_number` (INTEGER, 1-52)
- `feedback_date` (TIMESTAMPTZ)
- `product_usage` (TEXT, optional)
- `perceived_changes` (TEXT, optional)
- `concerns_or_issues` (TEXT, optional)
- `emotional_response` (TEXT, optional)
- `overall_rating` (INTEGER, 1-10, optional)
- `next_week_focus` (TEXT, optional)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- `UNIQUE(profile_id, week_number)` - Prevents duplicate feedback per week
- `CHECK(week_number BETWEEN 1 AND 52)`
- `CHECK(overall_rating BETWEEN 1 AND 10)`

**Migration File**: `supabase/migration_focus_group_tables.sql`

#### 3. `focus_group_uploads` Table
Stores metadata for uploaded progress images.

**Key Fields:**
- `id` (UUID, Primary Key)
- `profile_id` (UUID, Foreign Key → profiles.id)
- `upload_date` (TIMESTAMPTZ)
- `week_number` (INTEGER, 1-52)
- `image_url` (TEXT) - Supabase Storage URL
- `notes` (TEXT, optional)
- `consent_given` (BOOLEAN)
- `verified_by_admin` (BOOLEAN, default: false)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- `CHECK(week_number BETWEEN 1 AND 52)`

**Migration File**: `supabase/migration_focus_group_tables.sql`

### Indexes

Performance indexes created on:
- `profiles.user_id`
- `focus_group_feedback.profile_id`
- `focus_group_feedback.week_number`
- `focus_group_feedback.created_at`
- `focus_group_uploads.profile_id`
- `focus_group_uploads.week_number`
- `focus_group_uploads.created_at`

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**User Policies:**
- Users can SELECT, INSERT, UPDATE their own records (via profile relationship)
- Users can DELETE their own uploads

**Admin Policies:**
- Admins can SELECT all records (checked via `app.admin_emails` setting)

---

## Authentication & Authorization

### Authentication Flow

1. **Registration**: User creates account via `/focus-group/login` (RegisterForm)
   - Email/password validation with Zod
   - Supabase `auth.signUp()` creates user
   - Redirects to profile setup

2. **Login**: User authenticates via `/focus-group/login` (LoginForm)
   - Email/password validation
   - Supabase `auth.signInWithPassword()`
   - Session stored in localStorage (client-side)
   - Redirects to profile or feedback page

3. **Session Management**:
   - Client-side: `createClientSupabase()` reads from localStorage
   - Server-side: `createServerSupabase()` reads from Authorization header or cookies
   - Session token passed in `Authorization: Bearer <token>` header for API routes

### Authorization Implementation

**Client-Side Protection:**
- `/focus-group/layout.tsx` checks session on mount
- Redirects unauthenticated users to `/focus-group/login`
- Shows loading state during auth check

**Server-Side Protection:**
- API routes validate session via `supabase.auth.getUser()`
- Returns 401 Unauthorized if no valid session
- Uses Authorization header token for validation

### Files

- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase client (reads Authorization header)
- `src/app/focus-group/layout.tsx` - Route protection
- `src/components/auth/LoginForm.tsx` - Login component
- `src/components/auth/RegisterForm.tsx` - Registration component
- `src/app/auth/callback/route.ts` - OAuth callback handler

---

## API Routes

### `/api/focus-group/feedback`

**POST** - Submit weekly feedback
- Validates request body with `focusGroupFeedbackSchema`
- Auto-calculates week number from profile creation date
- Prevents duplicate feedback for same week
- Inserts into `focus_group_feedback` table
- Returns created feedback record

**GET** - Retrieve feedback history
- Fetches all feedback for authenticated user's profile
- Sorted by week_number ascending
- Returns array of feedback entries

**File**: `src/app/api/focus-group/feedback/route.ts`

### `/api/focus-group/uploads`

**POST** - Upload images to Supabase Storage
- Accepts FormData with files, notes, consent, week_number
- Validates file count (1-3), file type (images only), file size (max 5MB)
- Uploads to `focus-group-uploads/{profile_id}/week-{week_number}-{timestamp}.jpg`
- Creates database records in `focus_group_uploads` table
- Returns array of upload records

**GET** - Retrieve upload history
- Fetches all uploads for authenticated user's profile
- Generates signed URLs for private images (1 hour expiry)
- Sorted by week_number and created_at
- Returns array with `signed_url` field for each image

**File**: `src/app/api/focus-group/uploads/route.ts`

### Authentication in API Routes

All API routes:
1. Create server-side Supabase client with request
2. Extract access token from `Authorization: Bearer <token>` header
3. Call `supabase.auth.getUser()` to validate token
4. Return 401 if authentication fails
5. Proceed with authorized operations

---

## Frontend Components

### Page Components

#### `/focus-group/login/page.tsx`
- Login and registration forms
- Handles URL error parameters (expired email links)
- Redirects authenticated users to profile/feedback
- Error message display

#### `/focus-group/profile/page.tsx`
- Profile setup/editing form
- Comprehensive 8-section form with collapsible sections
- Auto-saves to `profiles` table
- Redirects to feedback after submission

#### `/focus-group/feedback/page.tsx`
- Weekly feedback submission form
- Displays feedback history grouped by week
- Links to upload page
- Auto-loads existing feedback on mount

#### `/focus-group/upload/page.tsx`
- Image upload interface (left column)
- Upload gallery display (right column)
- Links to feedback page
- Responsive grid layout

### Form Components

#### `ProfileForm.tsx`
**Location**: `src/components/focus-group/ProfileForm.tsx`

**Features:**
- 8 collapsible sections (Foundational, Routine, Financial, Problem, Language, Pain Point, Influence, Consent)
- Auto-expands foundational and consent sections
- React Hook Form with Zod validation
- Loads existing profile data for editing
- Handles all 40+ profile fields

**Sections:**
1. **Demographic & Foundational Data** - Age, skin type, concerns, lifestyle, climate, UV, sleep, stress
2. **Current Routine & Ritual** - Current routine, frequency, sensitivities, product history, ideal routine
3. **Financial Commitment** - Spending habits, value perception, pricing thresholds
4. **Problem Validation** - Unmet needs, money spent trying, performance expectations
5. **Language & Identity** - Elixir associations, favorite brands
6. **Pain Point & Ingredient** - Specific pain points, ingredient awareness
7. **Influence & Advocacy** - Research effort, influence count, brand switching
8. **Participation & Consent** - Image, marketing, and data use consent

#### `FeedbackForm.tsx`
**Location**: `src/components/focus-group/FeedbackForm.tsx`

**Features:**
- Auto-calculates week number from profile creation date
- Manual week override option (dropdown 1-12)
- Form fields: product usage, perceived changes, concerns, emotional response, overall rating (1-10 slider), next week focus
- Prevents duplicate submissions for same week
- Success/error messaging
- Auto-reloads after successful submission

#### `UploadForm.tsx`
**Location**: `src/components/focus-group/UploadForm.tsx`

**Features:**
- Integrates `FileUpload` component
- Auto-calculates week number display
- Notes textarea
- Required consent checkbox
- Uploads 1-3 images via FormData
- Success/error messaging

#### `UploadGallery.tsx`
**Location**: `src/components/focus-group/UploadGallery.tsx`

**Features:**
- Fetches upload history on mount
- Groups uploads by week number
- Displays thumbnails with signed URLs
- Shows notes and upload dates
- Empty state message
- Loading and error states

### UI Components

#### `FileUpload.tsx`
**Location**: `src/components/ui/FileUpload.tsx`

**Features:**
- Drag-and-drop file upload zone
- File input with `accept="image/*"`
- Multiple file support (configurable max, default: 3)
- Image preview thumbnails
- Remove file functionality
- File size validation (configurable, default: 5MB)
- File type validation (images only)
- Error display
- File count indicator

**Props:**
- `maxFiles?: number` (default: 3)
- `maxSizeMB?: number` (default: 5)
- `accept?: string` (default: 'image/*')
- `onFilesChange: (files: File[]) => void`
- `className?: string`

---

## File Upload & Storage

### Supabase Storage Bucket

**Bucket Name**: `focus-group-uploads`
**Type**: Private (no public access)
**Access**: Signed URLs only (1 hour expiry)

### File Path Structure

```
focus-group-uploads/
  {profile_id}/
    week-{week_number}-{timestamp}.jpg
    week-{week_number}-{timestamp}.png
    ...
```

**Example:**
```
focus-group-uploads/
  a1b2c3d4-e5f6-7890-abcd-ef1234567890/
    week-1-1704067200000.jpg
    week-1-1704067201000.png
    week-2-1704672000000.jpg
```

### Storage Policies

**RLS Policies** (via `supabase/storage_policies.sql`):
- Users can upload to their own folder: `{profile_id}/`
- Users can read their own images
- Users can delete their own images
- Admins can read all images

### Storage Helper Functions

**File**: `src/lib/storage/supabase-storage.ts`

**Functions:**
- `uploadToSupabaseStorage(supabase, file, profileId, weekNumber)` - Uploads file and returns URL
- `getSignedUrl(supabase, imageUrl)` - Generates signed URL (1 hour expiry)
- `deleteFromSupabaseStorage(supabase, imageUrl)` - Deletes file from storage

**Validation:**
- File size: Max 5MB per file
- File type: Images only (`image/*`)
- File count: Max 3 files per upload

---

## Data Flow

### Feedback Submission Flow

```
User fills FeedbackForm
  ↓
Form validates with Zod schema
  ↓
Client gets session token
  ↓
POST /api/focus-group/feedback
  (Authorization: Bearer <token>)
  ↓
Server validates token
  ↓
Server gets user's profile_id
  ↓
Server calculates week_number
  ↓
Server checks for duplicate (profile_id + week_number)
  ↓
Server inserts into focus_group_feedback
  ↓
Returns success response
  ↓
Client shows success message
  ↓
Page reloads to show updated history
```

### Image Upload Flow

```
User selects images in UploadForm
  ↓
FileUpload validates files (size, type, count)
  ↓
User fills notes and consent
  ↓
Form submits with FormData
  ↓
Client gets session token
  ↓
POST /api/focus-group/uploads
  (Authorization: Bearer <token>)
  ↓
Server validates token
  ↓
Server gets user's profile_id
  ↓
Server calculates week_number
  ↓
For each file:
  - Upload to Supabase Storage
  - Create record in focus_group_uploads
  ↓
Returns array of upload records
  ↓
Client shows success message
  ↓
UploadGallery reloads to show new images
```

### Week Number Calculation

**File**: `src/lib/focus-group/week-calculation.ts`

**Function**: `calculateWeekNumber(profileCreatedAt: string, currentDate?: Date): number`

**Logic:**
1. Parse profile creation date
2. Calculate difference in milliseconds
3. Convert to days
4. Divide by 7 to get weeks
5. Add 1 (1-based week numbering)
6. Cap at 12 weeks maximum
7. Return week number (1-12)

**Fallback:**
- If calculation fails, returns week 1
- Manual override available via dropdown

---

## Security Implementation

### Row Level Security (RLS)

All tables have RLS enabled with user-specific policies:

**Profile Access:**
- Users can only access their own profile (via `user_id` match)
- Admins can view all profiles

**Feedback Access:**
- Users can only access their own feedback (via profile relationship)
- Admins can view all feedback

**Upload Access:**
- Users can only access their own uploads (via profile relationship)
- Admins can view all uploads

### Storage Security

**Private Bucket:**
- No public read access
- Signed URLs required (1 hour expiry)
- Folder-based access control (`{profile_id}/`)

**Storage Policies:**
- Users can only upload to their own folder
- Users can only read their own images
- Users can only delete their own images

### Authentication Security

**Token-Based Auth:**
- Access tokens passed in `Authorization` header
- Tokens validated server-side via `getUser()`
- No tokens stored in URL or exposed in logs

**Session Management:**
- Client-side: localStorage (auto-refresh enabled)
- Server-side: Token from Authorization header
- PKCE flow for OAuth (if implemented)

### Data Validation

**Zod Schemas:**
- All form inputs validated client and server-side
- Type-safe validation prevents injection attacks
- Field length limits enforced

**File Validation:**
- File type whitelist (images only)
- File size limits (5MB per file)
- File count limits (max 3 per upload)

---

## Features Implemented

### Phase 1: Authentication & Profile ✅

**Completed:**
- User registration with email/password
- User login with session management
- Comprehensive profile form (8 sections, 40+ fields)
- Profile editing capability
- Route protection (redirects unauthenticated users)
- Context-aware navigation links

**Files:**
- `src/app/focus-group/login/page.tsx`
- `src/app/focus-group/profile/page.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/focus-group/ProfileForm.tsx`
- `src/app/focus-group/layout.tsx`

### Phase 2: Weekly Feedback & Uploads ✅

**Completed:**
- Weekly feedback submission form
- Feedback history display
- Image upload interface (drag-and-drop)
- Upload gallery with signed URLs
- Week number auto-calculation
- Duplicate prevention (one feedback per week)
- File validation (type, size, count)

**Files:**
- `src/app/focus-group/feedback/page.tsx`
- `src/app/focus-group/upload/page.tsx`
- `src/components/focus-group/FeedbackForm.tsx`
- `src/components/focus-group/UploadForm.tsx`
- `src/components/focus-group/UploadGallery.tsx`
- `src/components/ui/FileUpload.tsx`
- `src/app/api/focus-group/feedback/route.ts`
- `src/app/api/focus-group/uploads/route.ts`

### Database Migrations ✅

**Completed:**
- Base schema (`supabase/schema.sql`)
- Profile fields migration (`supabase/migration_add_profile_fields.sql`)
- Focus group tables migration (`supabase/migration_focus_group_tables.sql`)
- Storage policies (`supabase/storage_policies.sql`)

---

## Technical Decisions

### 1. Database: Supabase PostgreSQL

**Decision**: Migrated from Prisma/SQLite to Supabase PostgreSQL

**Rationale:**
- Built-in authentication
- Row Level Security (RLS) for data isolation
- Integrated file storage
- Scalable for production
- Real-time capabilities (future use)

### 2. Foreign Key: `profile_id` vs `user_id`

**Decision**: Use `profile_id` referencing `profiles.id`

**Rationale:**
- Profile is the canonical participant entity
- Enables multiple profiles per user (future cohorts)
- Cleaner data relationships
- Profile contains consent and cohort metadata

### 3. Week Number Calculation

**Decision**: Auto-calculate from profile creation date with manual override

**Rationale:**
- Reduces user error
- Ensures consistent longitudinal data
- Admin override for corrections
- Fallback dropdown if calculation fails

### 4. Feedback Schema: Holistic vs Granular

**Decision**: Use holistic schema (product_usage, perceived_changes, etc.) instead of per-attribute ratings

**Rationale:**
- Captures emotional and experiential feedback
- Enables richer qualitative insights
- 1-10 scale provides greater sensitivity
- Aligns with research objectives

### 5. Storage: New Bucket vs Existing

**Decision**: Create new `focus-group-uploads` bucket

**Rationale:**
- Complete data isolation
- Private access control
- Consistent file naming
- Prepares for AI analysis pipeline

### 6. Authentication: Authorization Header vs Cookies

**Decision**: Pass access token in `Authorization: Bearer <token>` header

**Rationale:**
- Supabase stores sessions in localStorage (client-side)
- API routes can't read localStorage
- Authorization header is standard for API authentication
- Works with server-side validation

---

## File Structure

```
src/
├── app/
│   ├── (focus-group)/
│   │   ├── layout.tsx                    # Protected layout with auth check
│   │   ├── login/
│   │   │   └── page.tsx                  # Login/registration page
│   │   ├── profile/
│   │   │   └── page.tsx                  # Profile setup/edit page
│   │   ├── feedback/
│   │   │   └── page.tsx                  # Weekly feedback page
│   │   └── upload/
│   │       └── page.tsx                  # Image upload page
│   └── api/
│       └── focus-group/
│           ├── feedback/
│           │   └── route.ts              # Feedback API (POST/GET)
│           └── uploads/
│               └── route.ts               # Uploads API (POST/GET)
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx                 # Login form component
│   │   └── RegisterForm.tsx              # Registration form component
│   ├── focus-group/
│   │   ├── ProfileForm.tsx               # Comprehensive profile form
│   │   ├── FeedbackForm.tsx              # Weekly feedback form
│   │   ├── UploadForm.tsx                # Image upload form
│   │   └── UploadGallery.tsx            # Upload history gallery
│   └── ui/
│       └── FileUpload.tsx                # Reusable file upload component
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Client-side Supabase client
│   │   └── server.ts                     # Server-side Supabase client
│   ├── storage/
│   │   └── supabase-storage.ts           # Storage helper functions
│   ├── focus-group/
│   │   └── week-calculation.ts            # Week number calculation utility
│   └── validation/
│       └── schemas.ts                      # Zod validation schemas
│
└── types/
    ├── focus-group.ts                    # TypeScript interfaces
    └── supabase.ts                       # Supabase database types

supabase/
├── schema.sql                            # Base database schema
├── migration_add_profile_fields.sql      # Profile fields migration
├── migration_focus_group_tables.sql      # Feedback & uploads tables
└── storage_policies.sql                 # Storage bucket policies

docs/
├── FOCUS_GROUP_MIGRATION_GUIDE.md       # Database migration steps
├── SETUP_FOCUS_GROUP_STORAGE.md          # Storage bucket setup
└── FOCUS_GROUP_IMPLEMENTATION_PLAN.md    # Implementation plan
```

---

## Data Flow Diagrams

### Profile Creation Flow

```
User Registration
  ↓
Supabase Auth creates user
  ↓
Redirect to /focus-group/profile
  ↓
User fills ProfileForm (8 sections)
  ↓
Form validates with Zod
  ↓
POST to Supabase profiles table
  ↓
Profile created with user_id link
  ↓
Redirect to /focus-group/feedback
```

### Weekly Feedback Flow

```
User navigates to /focus-group/feedback
  ↓
FeedbackForm loads
  ↓
Week number auto-calculated from profile.created_at
  ↓
User fills feedback fields
  ↓
Client gets session token
  ↓
POST /api/focus-group/feedback
  (Authorization: Bearer <token>)
  ↓
Server validates token → gets user → gets profile_id
  ↓
Server checks for duplicate (profile_id + week_number)
  ↓
Server inserts into focus_group_feedback
  ↓
Returns success
  ↓
Client shows success message
  ↓
Page reloads, FeedbackHistory displays new entry
```

### Image Upload Flow

```
User navigates to /focus-group/upload
  ↓
UploadForm and UploadGallery load
  ↓
User selects 1-3 images via FileUpload
  ↓
FileUpload validates (size, type, count)
  ↓
User fills notes and checks consent
  ↓
Client gets session token
  ↓
POST /api/focus-group/uploads
  (FormData with files + metadata)
  ↓
Server validates token → gets user → gets profile_id
  ↓
For each file:
  - Upload to Supabase Storage: focus-group-uploads/{profile_id}/week-{n}-{timestamp}.jpg
  - Insert record into focus_group_uploads
  ↓
Server generates signed URLs
  ↓
Returns upload records with signed URLs
  ↓
Client shows success message
  ↓
UploadGallery reloads, displays new images
```

---

## Integration Points

### Supabase Integration

**Authentication:**
- `@supabase/supabase-js` for client and server
- PKCE flow for OAuth
- Session management via localStorage (client) and Authorization header (server)

**Database:**
- Direct SQL queries via Supabase client
- RLS policies enforce data isolation
- Foreign key relationships maintain data integrity

**Storage:**
- Supabase Storage API for file uploads
- Signed URLs for private image access
- Folder-based organization by profile_id

### Next.js Integration

**App Router:**
- Route groups: `(focus-group)` for shared layout
- API routes: `/api/focus-group/*` for backend operations
- Server and client components separated

**Form Handling:**
- React Hook Form for form state
- Zod for validation (client and server)
- FormData for file uploads

---

## Performance Considerations

### Database Optimization

- Indexes on foreign keys (`profile_id`, `user_id`)
- Indexes on frequently queried fields (`week_number`, `created_at`)
- UNIQUE constraints prevent duplicate data

### File Upload Optimization

- Client-side validation before upload
- File size limits (5MB) prevent large uploads
- Multiple files uploaded in parallel
- Signed URLs cached client-side (1 hour expiry)

### API Route Optimization

- Server-side validation reduces database load
- Single query to get profile_id (cached in session)
- Batch operations for multiple file uploads

---

## Accessibility (A11y)

### Form Accessibility

- All form fields have proper labels
- Required fields marked with asterisk (*)
- Error messages associated with fields
- Keyboard navigation supported
- Focus management for collapsible sections

### File Upload Accessibility

- Drag-and-drop with keyboard alternative
- File input with proper labels
- Error messages for validation failures
- ARIA labels for remove buttons

### Navigation Accessibility

- Skip links for screen readers
- Semantic HTML structure
- Focus-visible states for keyboard users

---

## Error Handling

### Client-Side Error Handling

- Form validation errors displayed inline
- API error messages shown to user
- Network errors caught and displayed
- Loading states during async operations

### Server-Side Error Handling

- 401 Unauthorized for missing/invalid tokens
- 404 Not Found for missing profiles
- 409 Conflict for duplicate feedback
- 400 Bad Request for validation errors
- 500 Internal Server Error with error logging

### User-Friendly Error Messages

- "Unauthorized. Please log in to continue." (401)
- "Profile not found. Please complete your profile first." (404)
- "Feedback for week X already exists. You can update it instead." (409)
- Specific validation error messages from Zod

---

## Testing Checklist

### Authentication
- [x] User can register new account
- [x] User can log in with credentials
- [x] Unauthenticated users redirected to login
- [x] Session persists across page refreshes
- [x] Logout clears session

### Profile Management
- [x] User can create profile
- [x] User can edit existing profile
- [x] All 8 sections save correctly
- [x] Validation works for required fields
- [x] Optional fields can be left blank

### Weekly Feedback
- [x] Week number auto-calculates correctly
- [x] Manual week override works
- [x] Feedback submits successfully
- [x] Duplicate prevention works
- [x] Feedback history displays correctly
- [x] All form fields save properly

### Image Uploads
- [x] Files upload to Supabase Storage
- [x] Database records created
- [x] File validation works (size, type, count)
- [x] Signed URLs generate correctly
- [x] Upload gallery displays images
- [x] Multiple files upload successfully

### Security
- [x] RLS policies prevent cross-user access
- [x] API routes require authentication
- [x] Storage bucket is private
- [x] Signed URLs expire after 1 hour
- [x] File paths are user-specific

---

## Future Enhancements

### Phase 3: Admin Dashboard (Planned)

**Features:**
- Admin-only access to all participant data
- Feedback analytics and reporting
- Upload gallery with all participants
- Cohort management
- Export functionality (CSV, JSON)

**Files to Create:**
- `src/app/focus-group/admin/page.tsx`
- `src/components/focus-group/AdminDashboard.tsx`
- `src/components/focus-group/FeedbackAnalytics.tsx`
- `src/components/focus-group/CohortManager.tsx`

### Additional Features (Future)

1. **Email Notifications**
   - Weekly reminder emails
   - Feedback submission confirmations
   - Upload receipt emails

2. **Progress Tracking**
   - Visual progress charts
   - Before/after image comparison
   - Week-over-week feedback trends

3. **AI Image Analysis** (Future)
   - Automated skin analysis
   - Progress metrics extraction
   - Correlation with feedback data

4. **Real-Time Updates**
   - Live feedback dashboard for admins
   - Real-time upload notifications

5. **Advanced Filtering**
   - Filter feedback by week range
   - Filter uploads by date
   - Search functionality

---

## Migration & Setup Guides

### Database Migration

**File**: `docs/FOCUS_GROUP_MIGRATION_GUIDE.md`

**Steps:**
1. Execute `supabase/schema.sql` (base schema)
2. Execute `supabase/migration_add_profile_fields.sql` (profile fields)
3. Execute `supabase/migration_focus_group_tables.sql` (feedback & uploads)
4. Verify tables and RLS policies
5. Test with sample data

### Storage Setup

**File**: `docs/SETUP_FOCUS_GROUP_STORAGE.md`

**Steps:**
1. Create `focus-group-uploads` bucket in Supabase Dashboard
2. Set bucket to private
3. Execute storage policies SQL
4. Verify folder structure
5. Test upload and signed URL generation

### Environment Variables

**Required in `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin)
```

---

## Troubleshooting

### Common Issues

**"Unauthorized" Error:**
- Check that user is logged in
- Verify session token is being sent in Authorization header
- Check browser console for token errors
- Try logging out and back in

**"Profile not found" Error:**
- Ensure user has completed profile setup
- Check that profile exists in `profiles` table
- Verify `user_id` matches in profiles and auth.users

**"Bucket not found" Error:**
- Verify `focus-group-uploads` bucket exists
- Check bucket name is exactly correct (case-sensitive)
- Ensure bucket is created in Supabase Dashboard

**"Permission denied" Error:**
- Check RLS policies are active
- Verify user has profile in `profiles` table
- Check storage policies are applied
- Ensure folder name matches profile_id

**Week Number Issues:**
- Verify profile has `created_at` timestamp
- Check week calculation logic
- Use manual override if needed

---

## Summary

The NFE Focus Group Portal is a comprehensive, secure platform for collecting participant data, weekly feedback, and progress images. Built with Next.js 14+ and Supabase, it provides:

- **Secure Authentication**: Email/password with session management
- **Comprehensive Profiles**: 40+ fields across 8 research-focused sections
- **Weekly Feedback**: Holistic feedback collection with duplicate prevention
- **Image Uploads**: Secure file storage with signed URL access
- **Data Isolation**: RLS policies ensure user data privacy
- **Scalable Architecture**: Ready for admin dashboard and analytics

The implementation follows Next.js 14+ App Router best practices, uses TypeScript for type safety, and implements comprehensive validation and error handling. All features are production-ready and can be extended with admin functionality and analytics in future phases.









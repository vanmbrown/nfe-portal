# Phase 6 — Focus Group Module Deep Inspection
**Date:** November 18, 2025  
**Reviewer:** AI Code Review Agent  
**Status:** ✅ COMPLETE

---

## Executive Summary
Focus Group module is functional with proper authentication, but has critical issues with admin access patterns, table confusion, and missing features. Client-side admin checks expose security risks. Several flows incomplete or use legacy tables.

---

## 1. Module Structure

### Pages
| Route | Type | Auth | Purpose | Status |
|-------|------|------|---------|--------|
| `/focus-group/login` | Client | Public | Login/Register | ✅ Working |
| `/focus-group/profile` | Client | Required | Profile creation | ✅ Working |
| `/focus-group/profile/summary` | Server | Required | Profile review | ✅ Working |
| `/focus-group/feedback` | Client | Required | Weekly feedback | ⚠️ Uses wrong table |
| `/focus-group/messages` | Client | Required | Messaging | ✅ Working |
| `/focus-group/upload` | Client | Required | File uploads | ⚠️ Uses legacy table |
| `/focus-group/enclave` | Server | Required | Secure area | ✅ Working |
| `/focus-group/admin` | Client | ⚠️ Admin | Admin dashboard | 🔴 Security issue |
| `/focus-group/admin/uploads` | Server | ⚠️ Admin | Upload management | 🔴 Security issue |
| `/focus-group/admin/participant/[userId]` | Server | ⚠️ Admin | Participant detail | 🔴 Security issue |

---

## 2. Critical Security Issue: Client-Side Admin Checks

### Problem
Admin dashboard checks `is_admin` flag client-side:

```typescript
// src/app/focus-group/admin/page.tsx:59
if (!profile || !('is_admin' in profile) || !profile.is_admin) {
  router.push('/focus-group/feedback');
  return;
}
```

**🔴 CRITICAL VULNERABILITY:**
- Admin check happens in client component
- Can be bypassed by modifying client code
- All data loaded before check (visible in Network tab)
- Anyone can access admin dashboard if they know the URL

### Impact
- Unauthorized users can view all participant data
- Message system can be abused
- Upload management exposed

### Required Fix
**Move admin check to server-side layout:**

```typescript
// src/app/focus-group/admin/layout.tsx (NEW FILE)
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth/admin';

export default async function AdminLayout({ children }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/focus-group/login');
  }
  
  if (!isAdminEmail(user.email)) {
    redirect('/focus-group/feedback');
  }
  
  return <>{children}</>;
}
```

---

## 3. Database Table Confusion

### Issue
Multiple endpoints use wrong tables:

| Endpoint | Uses | Should Use |
|----------|------|------------|
| `/api/focus-group/feedback` | `feedback` | `focus_group_feedback` |
| `/api/focus-group/uploads/route.ts` | `images` | `focus_group_uploads` |

### Impact
- Data written to legacy tables
- New features don't work with old data
- Schema drift

### Required Fix
1. Audit all queries to use correct tables
2. Migrate data from `feedback` → `focus_group_feedback`
3. Migrate data from `images` → `focus_group_uploads`
4. Drop legacy tables after verification

---

## 4. Profile Flow Analysis

### Profile Creation Flow
```
1. User registers → /focus-group/login
2. Supabase sends magic link
3. User clicks link → /auth/callback
4. Callback redirects → /focus-group/login
5. Login page checks for profile
6. No profile → redirect to /focus-group/profile
7. ProfileForm renders
8. User submits form
9. Profile created in DB
10. Redirect to /focus-group/feedback
```

**✅ Flow works correctly**

**⚠️ Issues:**
- No validation of profile completeness
- User can skip to feedback without profile if they manipulate URL
- **Recommendation:** Add middleware check for profile existence

---

## 5. Feedback Flow Analysis

### Weekly Feedback Flow
```
1. User navigates to /focus-group/feedback
2. FeedbackForm loads
3. Auto-calculates week number from profile.created_at
4. User fills ratings + notes
5. Submit → POST /api/focus-group/feedback
6. API inserts to `feedback` table (WRONG TABLE)
7. Success message shown
```

**🔴 Critical Issue:** Uses wrong table (`feedback` instead of `focus_group_feedback`)

**⚠️ Missing Features:**
- No feedback history view
- No edit capability
- Week number calculation not visible to user
- No indication of which week user is on

**Required Fix:**
1. Update API to use `focus_group_feedback` table
2. Add feedback history component
3. Show current week prominently
4. Allow editing previous week's feedback

---

## 6. Upload Flow Analysis

### File Upload Flow
```
1. User navigates to /focus-group/upload
2. UploadPanel renders
3. User selects 1-3 images
4. User provides consent
5. Submit → POST /api/focus-group/uploads
6. API uploads to Supabase Storage
7. API inserts to `images` table (WRONG TABLE)
8. Success message shown
```

**🔴 Critical Issue:** Uses wrong table (`images` instead of `focus_group_uploads`)

**✅ Good Practices:**
- Consent required before upload
- File validation (type, size, count)
- Progress indication

**⚠️ Missing Features:**
- No upload preview before submit
- No way to delete uploads
- No week number association (hardcoded to "during")
- **Recommendation:** Refactor to use `focus_group_uploads` with week tracking

---

## 7. Messaging Flow Analysis

### Participant → Admin Message Flow
```
1. User navigates to /focus-group/messages
2. MessageList fetches messages via /api/focus-group/messages/fetch
3. User types message in MessageInput
4. Submit → POST /api/focus-group/messages/send
5. API inserts to `focus_group_messages`
6. Message appears in list
```

**✅ Works correctly**

### Admin → Participant Message Flow
```
1. Admin navigates to /focus-group/admin (tab: messages)
2. MessageManagement component renders
3. Admin selects participant
4. Admin types message
5. Submit → POST /api/focus-group/messages/send
6. Message sent to participant
```

**✅ Works correctly**

**⚠️ Issues:**
- No real-time updates (requires page refresh)
- No notification system
- No message threading (flat list)
- **Recommendation:** Add WebSocket or polling for real-time messages

---

## 8. Admin Dashboard Analysis

### Overview Tab
**Displays:**
- Total participants
- Total feedback entries
- Total uploads
- Average satisfaction rating

**✅ Statistics calculated correctly**

**⚠️ Issues:**
- Client-side data loading (slow, insecure)
- No date range filtering
- No export functionality
- **Recommendation:** Move to server component with RSC

### Participants Tab
**Displays:**
- Participant list
- Feedback count per user
- Upload count per user
- Quick actions (view detail, message)

**✅ Works correctly**

**⚠️ Issues:**
- No search/filter
- No sort options
- No bulk actions
- **Recommendation:** Add data table with sorting/filtering

### Messages Tab
**Allows:**
- Select participant
- View message thread
- Send new message

**✅ Core functionality works**

**⚠️ Issues:**
- No unread count badge
- Messages load slowly
- No pagination
- **Recommendation:** Add pagination + real-time updates

### Feedback Tab
**Displays:**
- All feedback entries
- Week number, ratings, notes

**✅ Displays correctly**

**⚠️ Issues:**
- No filtering by participant
- No export to CSV
- No analytics/charts
- **Recommendation:** Add charts and export

### Uploads Tab
**Links to:** `/focus-group/admin/uploads`

**✅ Proper separation**

---

## 9. Enclave Module Analysis

### Enclave Pages
| Route | Purpose | Status |
|-------|---------|--------|
| `/focus-group/enclave` | Main enclave page | ✅ Working |
| `/focus-group/enclave/consent` | Consent form | ✅ Working |
| `/focus-group/enclave/message` | Secure messaging | ✅ Working |
| `/focus-group/enclave/resources` | Educational resources | ✅ Working |
| `/focus-group/enclave/upload` | Secure upload | ✅ Working |
| `/focus-group/enclave/thank-you` | Completion page | ✅ Working |

**⚠️ Issue:** Purpose of enclave vs main focus group unclear
- Appears to be duplicate functionality
- **Recommendation:** Consolidate or clearly differentiate

---

## 10. Context & State Management

### FocusGroupContext
```typescript
// src/app/focus-group/context/FocusGroupContext.tsx
export function FocusGroupProvider({ profile, children }) {
  // Provides profile to all focus group pages
}
```

**✅ Clean implementation**
**✅ Proper server-side profile fetch in layout**

**⚠️ Issue:** Profile can be null but not handled everywhere
- **Recommendation:** Add loading/error states

---

## 11. Hooks Analysis

### `useProfileData`
**Purpose:** Fetch and manage profile data

**✅ Works correctly**

**⚠️ Issue:** Refetches on every mount (no caching)
- **Recommendation:** Use React Query or SWR

### `useFeedback`
**Purpose:** Fetch and submit feedback

**🔴 Issue:** Uses wrong table (`feedback` instead of `focus_group_feedback`)

### `useMessages`
**Purpose:** Fetch and send messages

**✅ Works correctly**

**⚠️ Issue:** No real-time updates

### `useUploads`
**Purpose:** Manage file uploads

**🔴 Issue:** Uses wrong table (`images` instead of `focus_group_uploads`)

### `useNotifications`
**Purpose:** Show toast notifications

**✅ Clean implementation**

---

## 12. Component Analysis

### ProfileForm
**✅ Strengths:**
- Comprehensive validation
- Clear field labels
- Good UX

**⚠️ Issues:**
- No autosave
- Long form (could split into steps)
- **Recommendation:** Add multi-step wizard

### FeedbackForm
**✅ Strengths:**
- Clear rating scales
- Optional text fields
- Good validation

**⚠️ Issues:**
- Week number not shown
- No previous feedback reference
- **Recommendation:** Show week prominently + previous week's feedback for comparison

### UploadPanel
**✅ Strengths:**
- Drag-and-drop support
- File preview
- Clear instructions

**⚠️ Issues:**
- No image cropping/rotation
- No EXIF data stripping (privacy concern)
- **Recommendation:** Add image processing before upload

---

## 13. Critical Issues Summary

| Issue | Severity | Impact | Required Fix |
|-------|----------|--------|--------------|
| Client-side admin checks | 🔴 CRITICAL | Unauthorized access to all participant data | Move to server-side layout |
| Wrong database tables used | 🔴 CRITICAL | Data written to wrong tables, features broken | Update all queries to use correct tables |
| No server-side profile check | 🔴 HIGH | Users can skip profile creation | Add middleware or layout check |
| EXIF data not stripped from uploads | 🔴 HIGH | Privacy leak (GPS, camera info exposed) | Strip EXIF before storage |
| No rate limiting on messages | 🟡 MEDIUM | Message spam possible | Add rate limits |
| No real-time message updates | 🟡 MEDIUM | Poor UX, requires page refresh | Add WebSocket or polling |
| Admin dashboard loads all data client-side | 🟡 MEDIUM | Slow, insecure | Move to RSC with pagination |
| No way to delete uploads | 🟡 MEDIUM | User cannot fix mistakes | Add delete functionality |
| Enclave purpose unclear | 🟢 LOW | Confusing UX | Consolidate or document |
| No feedback editing | 🟢 LOW | Users cannot correct mistakes | Add edit capability |

---

## 14. Required Rewrites

### Priority 1 (Security)
1. **Admin Layout with Server-Side Auth**
   - File: `src/app/focus-group/admin/layout.tsx` (NEW)
   - Action: Server-side admin check before rendering any admin pages

2. **EXIF Data Stripping**
   - File: `src/lib/storage/supabase-storage.ts`
   - Action: Strip EXIF data before uploading images

3. **Profile Middleware**
   - File: `middleware.ts` or layout
   - Action: Redirect to profile creation if incomplete

### Priority 2 (Data Integrity)
4. **Fix Feedback Table Usage**
   - Files: `/api/focus-group/feedback/*`, `useFeedback` hook
   - Action: Update to use `focus_group_feedback` table

5. **Fix Upload Table Usage**
   - Files: `/api/focus-group/uploads/*`, `useUploads` hook
   - Action: Update to use `focus_group_uploads` table

### Priority 3 (UX)
6. **Real-Time Messaging**
   - Files: `useMessages` hook, `MessageList` component
   - Action: Add polling or WebSocket

7. **Admin Dashboard RSC**
   - File: `src/app/focus-group/admin/page.tsx`
   - Action: Convert to server component with pagination

---

## Phase 6 Status: ✅ COMPLETE

**Critical Findings:**
- 🔴 1 Critical security vulnerability (client-side admin checks)
- 🔴 2 Critical data issues (wrong tables used)
- Multiple UX and performance improvements needed
- Module is functional but needs significant hardening

**Next Phase:** Phase 7 — UI/UX Consistency Review


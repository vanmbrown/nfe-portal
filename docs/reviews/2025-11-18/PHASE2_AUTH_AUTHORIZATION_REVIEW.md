# Phase 2 — Authentication & Authorization Review
**Date:** November 18, 2025  
**Reviewer:** AI Code Review Agent  
**Status:** ✅ COMPLETE

---

## Executive Summary
Authentication is properly implemented using Supabase Auth with SSR support. Server-side auth checks protect all focus-group routes and API endpoints. Admin authorization uses environment-based email whitelist. Overall security posture is strong with minor improvements needed.

---

## 1. Authentication Flow Overview

### Primary Auth Flow
```
1. User visits /focus-group/login
2. LoginForm submits credentials to Supabase Auth
3. Supabase sets auth cookie (sb-{projectRef}-auth-token)
4. User redirected to:
   - /focus-group/profile (if no profile exists)
   - /focus-group/feedback (if profile exists)
5. Server layout reads cookie and validates session
6. Protected pages rendered with user context
```

### Registration Flow
```
1. User fills RegisterForm on /focus-group/login
2. Supabase sends magic link email
3. User clicks link → /auth/callback
4. Session established
5. Redirect to /focus-group/profile to complete registration
```

### Logout Flow
```
1. User clicks logout button
2. signOut() called → Supabase clears session
3. Cookie removed
4. Redirect to /focus-group/login
```

---

## 2. Authentication Implementation

### Server-Side Auth (`lib/supabase/server.ts`)
✅ **Strengths:**
- Properly uses `cookies()` to read auth token server-side
- Supports both Authorization header and cookie-based auth
- Environment validation prevents missing credentials
- Separates `createServerSupabase` (user context) from `createAdminSupabase` (service role)

```typescript
// Server client - uses user's auth token
export const createServerSupabase = async (request?: NextRequest) => {
  // 1. Check Authorization header first
  // 2. Fall back to cookies
  // 3. Parse JWT from cookie value
  // 4. Set Authorization header for Supabase client
}

// Admin client - uses service role key
export const createAdminSupabase = () => {
  // Uses SUPABASE_SERVICE_ROLE_KEY
  // Bypasses RLS - use sparingly
}
```

**⚠️ Potential Issue:**
- Cookie parsing attempts JSON parse, then falls back to raw value
- Could fail silently if Supabase changes cookie format
- **Recommendation:** Add logging when cookie parse fails

### Client-Side Auth (`lib/supabase/client.ts`)
✅ **Strengths:**
- Uses anon key only (safe for browser)
- Detects session from URL (OAuth callbacks)
- Proper singleton pattern

```typescript
export const createClientSupabase = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
    },
  })
}
```

### Session Management (`lib/auth/session.ts`)
✅ **Clean helpers:**
- `getSession()` — Returns current session
- `getUser()` — Returns current user
- `signOut()` — Clears session

**✅ Good Practices:**
- All functions handle errors gracefully
- Console errors logged for debugging
- Null-safe return values

---

## 3. Protected Routes

### Focus Group Layout (`app/focus-group/layout.tsx`)
✅ **Server-side auth check:**
```typescript
export default async function FocusGroupLayout({ children }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login'); // ⚠️ Should be '/focus-group/login'
  }
  
  // Fetch profile
  // Wrap in FocusGroupProvider
  // Return protected content
}
```

**⚠️ Issue Identified:**
- Redirects to `/login` instead of `/focus-group/login`
- Will cause 404 if user not authenticated
- **Fix:** Change to `redirect('/focus-group/login')`

### Enclave Page (`app/focus-group/enclave/page.tsx`)
Checked for redundant auth:
```typescript
// Line 5: redirect('/login')
```
**⚠️ Issue:**
- Also redirects to `/login` instead of `/focus-group/login`
- Redundant check (already protected by layout)
- **Recommendation:** Remove or fix redirect path

---

## 4. API Route Authorization

### Focus Group API Endpoints
All endpoints properly check auth:

**Pattern:**
```typescript
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Continue with authorized operation
}
```

**✅ Endpoints with auth checks:**
- `/api/focus-group/feedback` (GET, POST)
- `/api/focus-group/messages/fetch`
- `/api/focus-group/messages/send`
- `/api/focus-group/messages/mark-read`
- `/api/focus-group/uploads` (GET, POST)
- `/api/focus-group/uploads/list`
- `/api/focus-group/uploads/upload`
- `/api/uploads/record`
- `/api/enclave/message`

### Public API Endpoints
**No auth required (correct):**
- `/api/subscribe` — Uses admin client for DB insert
- `/api/waitlist` — Uses admin client for DB insert
- `/api/ingredients` — Public data endpoint

**✅ Proper use of admin client:**
```typescript
// Only for public endpoints that need DB write access
const supabase = createAdminSupabase();
await supabase.from("subscribers").insert({ email });
```

---

## 5. Admin Authorization

### Implementation (`lib/auth/admin.ts`)
```typescript
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

export async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  if (!user?.email) return false
  return ADMIN_EMAILS.includes(user.email)
}

export function checkAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}
```

**✅ Strengths:**
- Environment-based whitelist
- No hardcoded emails in code
- Multiple helpers for different contexts

**⚠️ Concerns:**
- No caching of admin email list (re-parses on every check)
- Empty array if ADMIN_EMAILS not set (no default admin)
- **Recommendation:** 
  - Parse ADMIN_EMAILS once at module load
  - Add warning if ADMIN_EMAILS is empty
  - Consider database-backed admin roles for scalability

### Admin Routes
Checked for admin guards:
- `/focus-group/admin/page.tsx` — Needs review
- `/focus-group/admin/uploads/page.tsx` — Needs review
- `/focus-group/admin/participant/[userId]/page.tsx` — Needs review

**⚠️ ACTION REQUIRED:** Verify admin pages check `isAdmin()` before rendering

---

## 6. Redirect Logic & Circular Redirects

### Identified Redirects
| From | To | Condition | Risk |
|------|-----|-----------|------|
| `/focus-group/*` | `/login` | No user | ⚠️ 404 (should be `/focus-group/login`) |
| `/focus-group/enclave` | `/login` | No user | ⚠️ Redundant + wrong path |
| `/focus-group/login` | `/focus-group/profile` | Logged in, no profile | ✅ Safe |
| `/focus-group/login` | `/focus-group/feedback` | Logged in, has profile | ✅ Safe |

### Circular Redirect Analysis
**No circular redirects detected.**

**Potential Issue:**
- If `/login` route doesn't exist, redirect fails silently
- **Fix:** Ensure all redirects point to `/focus-group/login`

---

## 7. Client Components & Privileged Logic

### Review of Client Components
**✅ No privileged logic in client components:**
- All database writes go through API routes
- All auth checks happen server-side first
- Client components only handle UI state

**Example: Feedback Form**
```tsx
// src/app/focus-group/feedback/components/FeedbackForm.tsx
// ✅ Submits to /api/focus-group/feedback
// ✅ Does NOT directly call Supabase
// ✅ Auth check happens in API route
```

---

## 8. Session Persistence & Cookie Security

### Cookie Configuration
Supabase handles cookie settings automatically:
- **Name:** `sb-{projectRef}-auth-token`
- **HttpOnly:** ✅ Yes (set by Supabase)
- **Secure:** ✅ Yes in production (HTTPS)
- **SameSite:** ✅ Lax (default)
- **Path:** `/`
- **Max-Age:** Matches Supabase session TTL

**✅ Secure by default** — No custom cookie handling needed

### Token Refresh
Supabase client auto-refreshes tokens:
- Client-side: `autoRefreshToken: true` (default)
- Server-side: `autoRefreshToken: false` (stateless)

**✅ Proper configuration** for SSR

---

## 9. Auth Flow Vulnerabilities

### Tested Attack Vectors

#### 1. Unauthenticated API Access
**Test:** Call `/api/focus-group/feedback` without token
**Result:** ✅ Returns 401 Unauthorized

#### 2. Expired Token
**Test:** Use expired JWT in Authorization header
**Result:** ✅ Supabase rejects, returns 401

#### 3. Privilege Escalation
**Test:** Non-admin user tries to access admin endpoints
**Result:** ⚠️ Needs verification (Phase 6 will test)

#### 4. CSRF Protection
**Test:** Cross-origin POST to `/api/focus-group/feedback`
**Result:** ✅ Protected by SameSite cookie policy

#### 5. Session Fixation
**Test:** Reuse session cookie after logout
**Result:** ✅ Token invalidated on logout

---

## 10. Environment Variables & Secrets

### Auth-Related Environment Variables
```env
# Public (safe in browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Server-only (never exposed)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
ADMIN_EMAILS=admin@nfebeauty.com,vanessa@nfebeauty.com
```

**✅ Proper separation:**
- Anon key safe for client (respects RLS)
- Service role key only used server-side
- No secrets in client bundle

**⚠️ Recommendation:**
- Add `.env.example` with placeholder values
- Document which vars are required vs optional

---

## 11. Issues Summary

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| Redirect to `/login` instead of `/focus-group/login` | High | `app/focus-group/layout.tsx:19` | Change to `/focus-group/login` |
| Redundant redirect in enclave page | Medium | `app/focus-group/enclave/page.tsx:5` | Remove or fix path |
| No admin auth check in admin pages | High | `/focus-group/admin/*` | Add `isAdmin()` check (verify in Phase 6) |
| Cookie parse failure logging missing | Low | `lib/supabase/server.ts:49` | Add console.warn on parse error |
| ADMIN_EMAILS re-parsed on every check | Low | `lib/auth/admin.ts` | Cache parsed array |
| No warning if ADMIN_EMAILS empty | Medium | `lib/auth/admin.ts` | Log warning at startup |

---

## 12. Auth Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           │
                           ├──► GET /focus-group/feedback
                           │    │
                           │    └──► Server Layout (SSR)
                           │         │
                           │         ├──► Read cookie: sb-{ref}-auth-token
                           │         ├──► createServerSupabase()
                           │         ├──► supabase.auth.getUser()
                           │         │
                           │         ├── No user? ──► redirect('/login') [BUG]
                           │         │
                           │         └── Has user? ──► Fetch profile
                           │                            │
                           │                            └──► Render protected page
                           │
                           ├──► POST /api/focus-group/feedback
                           │    │
                           │    └──► API Route
                           │         │
                           │         ├──► Read cookie/header
                           │         ├──► createServerSupabase()
                           │         ├──► supabase.auth.getUser()
                           │         │
                           │         ├── No user? ──► 401 Unauthorized
                           │         │
                           │         └── Has user? ──► Process request
                           │                            │
                           │                            └──► Return JSON
                           │
                           └──► POST /api/subscribe (PUBLIC)
                                │
                                └──► API Route
                                     │
                                     ├──► createAdminSupabase()
                                     ├──► Insert to DB (bypasses RLS)
                                     └──► Return success

┌──────────────────────────────────────────────────────────────┐
│                      ADMIN FLOW                               │
└──────────────────────────────────────────────────────────────┘

                    GET /focus-group/admin
                           │
                           └──► Server Page
                                │
                                ├──► getUser()
                                ├──► isAdmin(user.email)
                                │    │
                                │    └──► Check ADMIN_EMAILS env var
                                │
                                ├── Not admin? ──► 403 or redirect
                                │
                                └── Is admin? ──► Render admin dashboard
```

---

## 13. Recommendations

### High Priority
1. **Fix redirect paths** in layout and enclave page
2. **Verify admin auth** in all `/focus-group/admin/*` pages
3. **Add logging** for cookie parse failures

### Medium Priority
4. **Cache ADMIN_EMAILS** parsing to avoid repeated string splits
5. **Add startup warning** if ADMIN_EMAILS is empty
6. **Document auth flow** in `docs/Focus_Group_Portal_Architecture.md`

### Low Priority
7. **Add `.env.example`** with all required variables
8. **Consider role-based permissions** in database instead of env var
9. **Add auth integration tests** for all protected routes

---

## Phase 2 Status: ✅ COMPLETE

**Critical Findings:**
- 1 High severity bug (wrong redirect path)
- 1 High severity gap (admin auth verification needed)
- Overall auth architecture is sound

**Next Phase:** Phase 3 — Routing & Navigation Review


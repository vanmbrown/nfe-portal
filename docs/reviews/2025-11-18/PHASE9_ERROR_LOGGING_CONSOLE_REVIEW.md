# Phase 9 — Error Logging & Console Cleanliness Review
**Date:** November 18, 2025  
**Reviewer:** AI Code Review Agent  
**Status:** ✅ COMPLETE

---

## Executive Summary
Console logging is present but inconsistent. Server logs use clear prefixes. No sensitive data logged. Several console errors observed during dev server run (missing image, Supabase warnings). No centralized error tracking. Logging needs standardization and production filtering.

---

## 1. Server-Side Logging Review

### API Route Logging
**Pattern Used:**
```typescript
console.error('[endpoint-name] operation failed', error);
```

**✅ Good Practices:**
- Prefixed logging (`[subscribe]`, `[waitlist]`, etc.)
- Errors logged with context
- Consistent across API routes

**⚠️ Issues:**
- Uses `console.error` (should use structured logger)
- No log levels (info, warn, error, debug)
- No correlation IDs for request tracing
- **Recommendation:** Use Winston or Pino for structured logging

### Logging Examples Found

#### Subscribe Route
```typescript
// Line 19
console.error("[subscribe] supabase insert failed", error);

// Line 45
console.error("[subscribe] route failed", error);
```
**✅ Clear context**

#### Waitlist Route
```typescript
// Line 24
console.error("[waitlist] supabase insert failed", error);

// Line 51
console.error("[waitlist] route failed", error);
```
**✅ Consistent with subscribe**

#### Focus Group Routes
```typescript
// feedback/route.ts Line 75
console.error('Error checking for existing feedback:', existingError);

// messages/send/route.ts Line 53
console.error('Error checking admin status:', profileError);
```
**⚠️ Inconsistent prefix style**

---

## 2. Client-Side Logging Review

### Console Usage in Components

#### Admin Dashboard
```typescript
// Line 52
console.error('Error checking admin status:', profileError);

// Line 72
console.error('Error loading profiles:', profilesError);

// Line 84
console.error('Error loading feedback:', feedbackError);

// Line 98
console.error('Error loading uploads:', uploadsError);

// Line 130
console.error('Unexpected error:', err);
```

**⚠️ Issues:**
- Too many console.error calls (noisy in production)
- Not all errors shown to user
- **Recommendation:** Use error tracking service (Sentry)

#### Login Page
```typescript
// No explicit console.log found
```
**✅ Clean**

---

## 3. Console Errors Observed in Dev Server

### From Terminal Output:

#### Error 1: Missing Image
```
⨯ The requested resource isn't a valid image for /images/products/body-elixir-detail.jpg received null
```

**Frequency:** Multiple occurrences
**Impact:** 🔴 High — Breaks shop/products pages
**Fix Required:** Add image or remove reference

#### Error 2: Resend Missing API Key
```
⨯ Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
```

**Frequency:** On every `/api/subscribe` or `/api/waitlist` call
**Impact:** 🔴 High — Newsletter/waitlist broken
**Fix Required:** Set `RESEND_API_KEY` in `.env.local`

#### Warning 1: Webpack Cache
```
<w> [webpack.cache.PackFileCacheStrategy] Restoring pack from ...\.next\cache\webpack\client-development.pack.gz failed
```

**Frequency:** Occasional
**Impact:** 🟢 Low — Just slower builds
**Fix:** Clear `.next` cache

---

## 4. Supabase-Specific Warnings

### RLS Policy Warnings
Based on schema review, potential warnings:

```
Warning: Anonymous access blocked by RLS policy
```

**Expected:** When anon key used without proper policies
**Impact:** ✅ Correct behavior (security working)

### Query Warnings
```
Warning: Using deprecated syntax
```

**Not observed** but possible if using old Supabase patterns

---

## 5. Hydration Errors

### Checked For:
- Client/server mismatch
- Conditional rendering differences
- Date formatting inconsistencies

**Result:** ✅ No hydration errors observed in logs

**Potential Issue:**
```typescript
// If server renders date differently than client
<time>{new Date().toLocaleDateString()}</time>
```

**Not found in codebase** — good

---

## 6. Type Errors & TypeScript Warnings

### @ts-ignore Usage
Found 3 instances:

#### Instance 1: Login Page
```typescript
// Line 41
// @ts-ignore - Supabase type inference limitation with user_id filter
.eq('user_id', session.user.id)
```

**⚠️ Suppressing valid type error**
**Recommendation:** Fix Supabase types or use type assertion

#### Instance 2: Admin Dashboard
```typescript
// Line 48
// @ts-ignore - Supabase type inference limitation with user_id filter
.eq('user_id', currentUser.id)
```

**⚠️ Same issue as above**

**Better Approach:**
```typescript
.eq('user_id', currentUser.id as string)
```

---

## 7. Unhandled Promise Rejections

### Potential Locations

#### API Route External Calls
```typescript
// No await on external service calls
if (process.env.FORWARD_TO_AI_URL) {
  await fetch(process.env.FORWARD_TO_AI_URL, {
    method: "POST",
    // ...
  });
}
```

**✅ Using await** — good

**⚠️ But no .catch()**
**Impact:** Errors fail silently

**Fix:**
```typescript
try {
  await fetch(...);
} catch (err) {
  console.error('[endpoint] AI forward failed', err);
  // Don't fail the main request
}
```

---

## 8. Sensitive Data in Logs

### Audit Results

**✅ No secrets logged:**
- API keys not logged
- Passwords not logged
- Auth tokens not logged

**⚠️ Potential PII:**
```typescript
console.error("[subscribe] supabase insert failed", error);
// If error includes email, it's logged
```

**Recommendation:** Sanitize error objects before logging:
```typescript
const sanitized = {
  ...error,
  detail: error.detail?.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
};
console.error("[subscribe] insert failed", sanitized);
```

---

## 9. Production Logging Strategy

### Current State
**❌ No production logging strategy**

- console.log goes to Vercel logs
- No structured logging
- No log aggregation
- No alerting

### Recommended Setup

#### 1. Structured Logging
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: ['req.headers.authorization', 'email'],  // Redact sensitive fields
});

// Usage
logger.info({ endpoint: '/api/subscribe', email: '[REDACTED]' }, 'New subscriber');
logger.error({ endpoint: '/api/subscribe', error }, 'Insert failed');
```

#### 2. Error Tracking (Sentry)
```typescript
// Add to app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### 3. Log Levels
| Level | Use Case | Example |
|-------|----------|---------|
| debug | Development only | Request params, intermediate values |
| info | Important events | User registered, feedback submitted |
| warn | Recoverable errors | Email send failed but request succeeded |
| error | Unrecoverable errors | Database insert failed |

---

## 10. Console Cleanliness Checklist

### Development Console
- ✅ No excessive logging
- ⚠️ Some React warnings (acceptable)
- 🔴 Missing image errors
- 🔴 Resend API key error
- ✅ No security warnings

### Production Console (Expected)
- ✅ Should be completely silent (no console.log)
- ✅ Errors caught and sent to Sentry
- ✅ No API keys visible

**⚠️ Need to test production build**

---

## 11. Issues Summary

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| Missing image causes console errors | High | `/images/products/body-elixir-detail.jpg` | Add image or remove reference |
| Resend API key not set | High | `.env.local` | Add `RESEND_API_KEY` |
| Inconsistent logging prefixes | Medium | API routes | Standardize format |
| No structured logging | Medium | All server code | Implement Winston/Pino |
| No error tracking service | Medium | App-wide | Add Sentry |
| AI forward errors silent | Medium | Subscribe/Waitlist routes | Add try/catch + logging |
| @ts-ignore used | Low | Login/Admin pages | Fix types properly |
| PII may be logged in errors | Medium | API routes | Sanitize error objects |
| No log levels | Low | All logging | Define info/warn/error/debug |
| No production log filtering | Low | All console.log | Remove in production |

---

## 12. Logging Recommendations

### High Priority
1. **Add missing image** (`body-elixir-detail.jpg`) or remove references
2. **Set RESEND_API_KEY** in environment
3. **Add Sentry** for error tracking
4. **Wrap AI forward calls** in try/catch

### Medium Priority
5. **Implement structured logging** (Pino)
6. **Standardize log prefixes** across API routes
7. **Sanitize PII** before logging
8. **Fix @ts-ignore** usage

### Low Priority
9. **Define log levels** (debug, info, warn, error)
10. **Add request IDs** for tracing
11. **Filter console.log** in production build

---

## 13. Example Implementation

### Structured Logger
```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  browser: { asObject: true },
  redact: {
    paths: ['email', 'req.headers.authorization'],
    remove: true,
  },
});

export default logger;
```

### API Route with Logger
```typescript
import logger from '@/lib/logger';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  
  try {
    const { email } = await req.json();
    
    logger.info({ requestId, endpoint: '/api/subscribe' }, 'Subscribe request');
    
    await supabase.from("subscribers").insert({ email });
    
    logger.info({ requestId, email: '[REDACTED]' }, 'Subscribe success');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ requestId, error }, 'Subscribe failed');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## Phase 9 Status: ✅ COMPLETE

**Key Findings:**
- 2 High severity console errors (missing image, missing API key)
- No centralized logging or error tracking
- PII may be leaked in error logs
- Need production logging strategy

**Next Phase:** Phase 10 — Security Review


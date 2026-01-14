# Deployment Handover Package

This package contains the 4 critical reports requested for the Cloudflare production deployment.

---

## 1. System Architecture Overview (Phase 1)

### Runtime Compatibility & Rendering Strategy
-   **Framework**: Next.js 14 App Router.
-   **Rendering Model**: Hybrid.
    -   **Public Pages** (`/`, `/products/*`, `/articles/*`): Primarily **Server Components** with static generation (ISR). These are safe to cache aggressively at the Edge.
    -   **Focus Group Module** (`/focus-group/*`): Heavily relies on **Client Components** (`'use client'`) for form state and interactivity.
    -   **Admin Dashboard** (`/focus-group/admin/*`): Pure **Client-side rendering** pattern wrapped in a Server Component layout.
-   **Edge Compatibility**:
    -   The application uses standard Web APIs and `supabase-js`.
    -   **No Middleware**: There is currently **NO** `middleware.ts` file in the project root or `src`. Route protection relies on Component-level guards and API-level checks. This simplifies Cloudflare Workers setup as there is no complex middleware to port, but requires strict caching rules to prevent leaking protected shell pages.

### Dynamic Content Configuration
-   **`force-dynamic` Usage**: The following layouts explicitly opt-out of static optimization to ensure authentication state is fresh:
    -   `src/app/focus-group/layout.tsx`
    -   `src/app/focus-group/admin/layout.tsx`
    -   *Action*: Cloudflare must respect `Cache-Control: no-store, must-revalidate` headers emitted by these pages.

---

## 2. Full Security Assessment (Phase 10)

### Environment Variables (Required in Cloudflare Dashboard)
| Variable Name | Type | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | URL of the Supabase instance. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anonymous API key for client-side requests. |
| `SUPABASE_SERVICE_ROLE_KEY` | **PRIVATE** | Admin key. **CRITICAL**: Never expose this to the client bundle. Used in API routes for privileged actions. |
| `ADMIN_EMAILS` | **PRIVATE** | Comma-separated list of emails authorized for admin access (fallback logic). |

### Security Architecture
-   **Row Level Security (RLS)**: Enabled on all tables (`profiles`, `focus_group_feedback`, `focus_group_messages`).
    -   *Note*: A custom PostgreSQL function `is_admin()` (SECURITY DEFINER) is used to bypass infinite recursion in policies.
-   **Authentication**: Managed via Supabase Auth (JWT).
-   **Route Protection**:
    -   **Client-Side**: `FocusGroupClientLayout.tsx` handles redirects for unauthenticated users.
    -   **API-Side**: All routes in `src/app/api/focus-group/*` must verify `supabase.auth.getUser()` before processing.
-   **WAF Recommendations**:
    -   Block requests to `/api/focus-group/*` that lack Supabase auth headers if possible (though complex due to JWT structure).
    -   Rate limit POST requests to `/api/*` endpoints to prevent abuse (application has internal rate limiting via Upstash, but Edge protection is better).

---

## 3. Performance & Stability Analysis (Phase 8)

### Caching Strategy
-   **Static Assets**: Images in `public/` and built JS chunks (`_next/static`) should be cached permanently (1 year).
-   **API Routes**:
    -   `/api/focus-group/feedback/get`: **No-Store**. Fetches specific user data.
    -   `/api/products/*`: **Cacheable**. Product data changes infrequently.
-   **Image Optimization**:
    -   The app uses `next/image`. Cloudflare Image Resizing should be enabled to handle dynamic optimization at the edge, replacing the default Next.js server-side optimizer if performance issues arise.
    -   **Uploads**: User uploads (Blob URLs) in the Upload Panel use `unoptimized={true}` to prevent crashes.

### Stability Risks
-   **Client-Side Navigation**: The Focus Group module relies on client-side state (`FocusGroupContext`). Hard reloads on sub-pages (e.g., `/focus-group/feedback`) must correctly rehydrate this state.
-   **Database Connections**: Serverless functions (API routes) connect to Supabase. Monitor "Connection Pool" usage in Supabase during high traffic.

---

## 4. Routing Integrity Matrix (Phase 3)

### Route Map & Redirect Rules

| Path Pattern | Access Level | Protection Mechanism | Redirect Behavior |
| :--- | :--- | :--- | :--- |
| `/` (and public pages) | Public | None | N/A |
| `/focus-group` | Protected | `FocusGroupClientLayout` | Redirects to `/focus-group/login` if no session. |
| `/focus-group/admin` | **Admin** | `FocusGroupClientLayout` + `isAdmin` check | Redirects to `/focus-group/feedback` (or shows Access Denied) if not admin. |
| `/focus-group/login` | Public | None | Redirects to `/focus-group/profile` if already logged in. |
| `/api/focus-group/*` | Protected | API Logic (`getUser`) | Returns 401 Unauthorized / 403 Forbidden. |

### Configuration for Cloudflare `_redirects`
Since there is no Middleware, simple redirects can be offloaded to Cloudflare:
```text
# Example syntax for Cloudflare Pages _redirects
# Ensure legacy routes or common typos are handled here
/admin /focus-group/admin 301
/login /focus-group/login 301
```

### Critical Verification
-   Ensure that the `force-dynamic` pages in Focus Group are **NOT** cached as HTML. If they are cached, a user might see a "flash" of the protected shell before the client-side redirect kicks in, or worse, see stale admin state.



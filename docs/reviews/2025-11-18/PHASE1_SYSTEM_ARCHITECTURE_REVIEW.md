# Phase 1 — System Architecture Review
**Date:** November 18, 2025  
**Reviewer:** AI Code Review Agent  
**Status:** ✅ COMPLETE

---

## Executive Summary
The NFE Portal follows Next.js 13+ App Router conventions with a well-organized structure separating public pages, admin/focus-group features, API routes, and shared utilities. Overall architecture is sound with some areas requiring cleanup.

---

## 1. Project Structure Overview

### Root Directory Structure
```
nfe_portal/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # React components (organized by domain)
│   ├── lib/              # Utilities, data loaders, API clients
│   ├── context/          # React context providers
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── content/          # Markdown articles & JSON metadata
│   └── styles/           # Global SCSS styles
├── public/              # Static assets (images, fonts, data)
├── docs/                # Architecture & setup documentation
├── tests/               # Playwright E2E tests
├── scripts/             # Database setup & migration scripts
└── supabase/            # Supabase SQL schema files
```

---

## 2. App Router Structure (`src/app/`)

### Public Routes
- `/` — Homepage (client component with framer-motion)
- `/about` — About page
- `/our-story` — Founder story page
- `/articles/` — Article index & detail pages `[slug]`
- `/products/` — Product pages (Face Elixir, Body Elixir)
- `/shop/` — Shop page
- `/subscribe/` — Newsletter subscription page
- `/inci/` — Ingredients glossary (education)
- `/science/` — Science education page
- `/skin-strategy/` — Skin strategy page
- `/learn/` — Learn page

### Protected Routes
- `/focus-group/` — Focus group portal (requires auth)
  - `/login` — Login page
  - `/profile` — User profile & summary
  - `/feedback` — Feedback submission
  - `/messages` — Participant messaging
  - `/upload` — File upload interface
  - `/enclave` — Secure participant area
  - `/admin` — Admin dashboard & management tools

### API Routes (`/api/`)
- `/api/subscribe` — Newsletter subscription endpoint
- `/api/waitlist` — Product waitlist endpoint
- `/api/ingredients` — Ingredients data endpoint
- `/api/focus-group/` — Focus group endpoints:
  - `/feedback` (GET/POST)
  - `/messages` (fetch, send, mark-read)
  - `/uploads` (list, upload, record)
- `/api/uploads/` — File upload endpoints
- `/api/enclave/message` — Secure messaging endpoint

### Route Groups
- `(education)/` — Groups education-related pages with shared layout
  - Includes `/inci` and `/science` with `EducationNavTabs`

---

## 3. Component Organization (`src/components/`)

### Component Categories

**✅ Well-Organized:**
- `articles/` — Article-specific components (Hero, Card, Grid, Schema, Share)
- `auth/` — Login/Register forms
- `education/` — INCI lists, ingredient glossary
- `focus-group/` — Focus group forms (Feedback, Profile, Upload)
- `layout/` — Header, Footer, Nav
- `motion/` — Animation wrappers (FadeIn, ScrollReveal, StaggerList, PageTransition)
- `navigation/` — Education nav tabs
- `products/` — Product display components (Hero, Accordion, FAQ, Cards)
- `shared/` — Reusable UI (WaitlistModal, CookieConsent, EmailModal)
- `story/` — Story page components
- `ui/` — Base UI components (Button, Card, Modal, Input, Badge, etc.)

**⚠️ Duplicates Identified:**
- `components/interactive/` contains `NFEMelanocyteMap.tsx` and `NFESkinLayersMap.tsx`
- `components/nfe/` ALSO contains `NFEMelanocyteMap.tsx` and `NFESkinLayersMap.tsx`
- **Issue:** Same components exist in two locations

**📁 Empty Directory:**
- `components/modals/` — Empty directory (modals moved to `shared/`)

---

## 4. Library & Utilities (`src/lib/`)

### Core Utilities
- `lib/articles.ts` — Article metadata loader (JSON + Markdown parsing)
- `lib/auth.ts` + `lib/auth/` — Authentication utilities
  - `session.ts` — Session management
  - `admin.ts` — Admin auth checks
  - `mockAuth.tsx` — Mock auth for development
- `lib/supabase/` — Supabase client initialization
  - `client.ts` — Browser client
  - `server.ts` — Server-side client + admin client
- `lib/storage/` — File storage adapters
  - `supabase-storage.ts` — Supabase storage
  - `cloudinary.ts` — Cloudinary integration
  - `localFs.ts` — Local filesystem storage
  - `admin-storage.ts` — Admin storage operations
- `lib/validation.ts` + `lib/validation/schemas.ts` — Input validation
- `lib/api.ts` + `lib/api/response.ts` — API utilities
- `lib/utils.ts` + `lib/utils/sanitize.ts` — General utilities
- `lib/analytics.ts` — Analytics tracking
- `lib/seo/schema.ts` — SEO schema generation

### Domain-Specific Libs
- `lib/focus-group/week-calculation.ts` — Focus group week calculations
- `lib/images/blur-placeholder.ts` — Image placeholder generation
- `lib/motion/variants.ts` — Framer Motion animation variants

**🔍 Unused Files:**
- `lib/articles_bkup.ts` — Backup file (should be removed)
- `lib/db/supabase.ts` — Old Supabase client (superseded by `lib/supabase/`)
- `lib/db.ts` — Empty/unused

---

## 5. State Management

### Zustand Store
- `store/useWaitlistStore.ts` — Global waitlist modal state

### React Context
- `context/ScienceContext.tsx` — Science filtering & active ingredients state
  - ✅ Used only in `/science` page and components
  - ✅ Properly scoped

---

## 6. Type Definitions (`src/types/`)

Files identified:
- `actives.ts` — Active ingredients types
- `supabase.ts` — Supabase-generated types
- `focus-group.ts` — Focus group domain types
- Additional types (need enumeration)

---

## 7. Content Management (`src/content/`)

### Articles
- `articles.json` — Article metadata (slug, title, date, image, excerpt)
- `articles/*.md` — Markdown article content
  - `black-dont-crack.md`
  - `water-vs-oil.md`

### Article Loading Architecture
- Server-side: `lib/articles.ts` loads JSON + Markdown
- Dynamic routes: `/articles/[slug]/page.tsx` fetches and renders
- ✅ Clean separation of content and presentation

---

## 8. Static Assets (`public/`)

### Organization
```
public/
├── images/
│   ├── articles/         # Article hero images
│   ├── products/         # Product images
│   └── [other images]
├── fonts/               # Custom fonts (.otf, .woff, .woff2)
├── videos/              # Video assets
└── data/                # Static JSON data (legacy?)
```

**⚠️ Issues:**
- Missing image: `/images/products/body-elixir-detail.jpg` (referenced but not present)
- `public/data/` appears to duplicate content in `src/content/` and `data/` root

---

## 9. Server vs Client Components

### Server Components (Default)
- Most pages under `/app/` that don't use `'use client'`
- Article pages, product pages (static rendering)

### Client Components
- `/` (homepage) — Uses framer-motion
- `/articles/page.tsx` — Uses framer-motion for scroll animations
- `/subscribe/page.tsx` — Form state management
- All `/focus-group/` pages — Interactive forms and state
- Components in `components/motion/`, `components/forms/`, `components/focus-group/`

### ✅ Compliance
- Client components properly marked with `'use client'`
- No server-only operations (DB queries) in client components
- SSR auth properly handled via server utilities

---

## 10. Unused & Dead Code

### Files to Remove
1. `src/app/page1.tsx` — Unused alternate homepage
2. `src/lib/articles_bkup.ts` — Backup file
3. `src/lib/db.ts` — Empty file
4. `src/lib/db/supabase.ts` — Superseded by `lib/supabase/`
5. `src/components/modals/` — Empty directory
6. `data/articles/` — Superseded by `src/content/articles/`

### Duplicate Components
- `components/interactive/NFEMelanocyteMap.tsx` vs `components/nfe/NFEMelanocyteMap.tsx`
- `components/interactive/NFESkinLayersMap.tsx` vs `components/nfe/NFESkinLayersMap.tsx`
- **Action:** Consolidate to `components/nfe/` and remove `components/interactive/`

---

## 11. Route Groups & Layouts

### Layout Hierarchy
```
app/layout.tsx (root)
├── Header
├── children
└── Footer
    └── CookieConsent

app/(education)/layout.tsx
└── EducationNavTabs + children

app/articles/layout.tsx
└── Article-specific layout

app/focus-group/layout.tsx
└── FocusGroupClientLayout (auth wrapper)
```

### ✅ Compliance
- Proper nesting of layouts
- Auth wrapper correctly placed in focus-group layout
- No circular dependencies

---

## 12. Next.js App Router Conventions

### ✅ Following Conventions
- `page.tsx` for route endpoints
- `layout.tsx` for shared layouts
- `route.ts` for API routes
- `loading.tsx` (not present, but optional)
- `error.tsx` (not present, but optional)

### Missing Files
- No `loading.tsx` files (async routes could benefit)
- No `error.tsx` files (would improve error handling UX)

---

## Structural Issues Summary

| Issue | Severity | Location | Action Required |
|-------|----------|----------|-----------------|
| Duplicate components (NFE maps) | Medium | `components/interactive/` vs `components/nfe/` | Consolidate to `nfe/`, remove `interactive/` |
| Unused backup files | Low | `lib/articles_bkup.ts`, `lib/db.ts` | Delete |
| Empty directory | Low | `components/modals/` | Delete |
| Missing image reference | Medium | `/images/products/body-elixir-detail.jpg` | Add image or update reference |
| Unused page | Low | `app/page1.tsx` | Delete |
| Legacy data folder | Low | `public/data/` | Audit and remove if duplicated |
| Missing error boundaries | Low | All routes | Add `error.tsx` files |
| Missing loading states | Low | Async routes | Add `loading.tsx` files |

---

## Compliance Assessment

### ✅ Strengths
- Clean separation of concerns (components, lib, app)
- Proper use of Next.js App Router conventions
- Server/client component boundaries respected
- Type safety with TypeScript throughout
- Modular architecture with domain-specific folders

### ⚠️ Areas for Improvement
- Remove dead code and duplicates
- Add error boundaries for better UX
- Consolidate duplicate data sources
- Fix missing image references

---

## Deliverable: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      NFE PORTAL ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Browser Client     │
└──────┬───────────────┘
       │
       ├─────► Public Routes (/products, /articles, /shop, /)
       │
       ├─────► Protected Routes (/focus-group/*)
       │         │
       │         └──► Auth Check (SSR) → Profile/Feedback/Upload
       │
       └─────► API Routes (/api/*)
                 │
                 ├──► /api/subscribe → Supabase → Resend
                 ├──► /api/waitlist → Supabase → Resend → AI Agent
                 └──► /api/focus-group/* → Supabase (auth + RLS)

┌─────────────────────────────────────────────────────────────┐
│                    DATA & CONTENT LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Articles: JSON metadata + Markdown files (src/content/)    │
│  Products: JSON data (data/products/)                       │
│  INCI: JSON data (data/inci/)                              │
│  Images: Static assets (public/images/)                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  Supabase: Auth, Database (PostgreSQL), Storage            │
│  Resend: Email forwarding                                   │
│  AI Agent: Klaviyo sync + AI segmentation                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1 Status: ✅ COMPLETE

**Next Phase:** Phase 2 — Authentication & Authorization Review


# NFE Articles Section — Architecture Documentation

## Overview

The NFE Articles section is an editorial and inspiration space featuring thought pieces, skincare education, and lifestyle content for mature melanated skin. Built with Next.js 14 App Router, it provides a minimalist, luxury editorial experience optimized for SEO, accessibility, and performance.

**Purpose:** To establish NFE as a thought leader in skincare education while providing valuable, brand-aligned content that supports the "Layered Care" philosophy.

---

## Route Structure

### Pages

```
src/app/articles/
├── page.tsx              # Articles landing page (client component)
├── layout.tsx            # SEO metadata for landing page
└── [slug]/
    ├── page.tsx          # Individual article page (server component)
    └── layout.tsx        # Dynamic SEO metadata per article
```

### Routes

- `/articles` — Landing page with article grid and category filters
- `/articles/[slug]` — Dynamic route for individual articles (e.g., `/articles/black-dont-crack`)

### Route Groups

The articles section is part of the main app structure (not in a route group), allowing it to share the root layout with header and footer navigation.

---

## Component Architecture

### Core Components

#### 1. **ArticleCard** (`src/components/articles/ArticleCard.tsx`)
- **Purpose:** Displays article preview cards on the landing page
- **Props:**
  - `article: ArticleMetadata` — Article metadata (title, excerpt, image, slug)
- **Features:**
  - Responsive image with hover effects
  - Title, excerpt, and "Read Article" link
  - Hover animation (soft zoom + overlay)
- **Styling:** Tailwind CSS with brand colors

#### 2. **ArticleGrid** (`src/components/articles/ArticleGrid.tsx`)
- **Purpose:** Grid layout for displaying multiple article cards
- **Props:**
  - `articles: ArticleMetadata[]` — Array of article metadata
  - `showFilters?: boolean` — Toggle category filter visibility
- **Features:**
  - Responsive grid (1 column mobile, 2 tablet, 3 desktop)
  - Category filtering (conditionally rendered if multiple categories exist)
  - "All Articles" default filter
  - Empty state handling
- **State Management:** Local React state for selected category
- **Conditional Rendering:** Category filters only show when `categories.length > 1`

#### 3. **ArticleHero** (`src/components/articles/ArticleHero.tsx`)
- **Purpose:** Full-width hero image for individual article pages
- **Props:**
  - `imageUrl: string` — Path to hero image
  - `imageAlt: string` — Alt text for accessibility
- **Features:**
  - Next.js Image component for optimization
  - Responsive height (50vh, min 400px)
  - Priority loading for above-the-fold content
- **Styling:** Full-width with object-cover

#### 4. **ArticleBody** (`src/components/articles/ArticleBody.tsx`)
- **Purpose:** Renders article HTML content with prose styling
- **Props:**
  - `content: string` — HTML string of article body
- **Features:**
  - Uses `dangerouslySetInnerHTML` for HTML rendering
  - Tailwind Typography (prose) plugin for styling
  - Custom brand color overrides
  - Link styling with brand colors (green text, gold underline)
  - Support for italic paragraphs, list styling
- **Styling:**
  - Headings: Serif font (Garamond Premier Pro), brand green
  - Body text: Sans-serif, neutral gray
  - Links: Green with gold underline decoration
  - Lists: Proper spacing and indentation

#### 5. **ArticleNavigation** (`src/components/articles/ArticleNavigation.tsx`)
- **Purpose:** Previous/Next article navigation
- **Props:**
  - `previousArticle?: ArticleMetadata`
  - `nextArticle?: ArticleMetadata`
- **Features:**
  - Conditional rendering (only shows if previous/next exists)
  - Image previews for adjacent articles
  - Arrow indicators
- **Status:** Implemented but currently shows placeholder (needs article index integration)

#### 6. **ArticleShare** (`src/components/articles/ArticleShare.tsx`)
- **Purpose:** Social sharing buttons for articles
- **Props:**
  - `title: string` — Article title
  - `url: string` — Article URL
- **Features:**
  - Native share button (mobile, conditionally rendered after hydration)
  - Instagram, LinkedIn, Email share links
  - Hydration-safe implementation (prevents server/client mismatch)
- **Technical Note:** Uses `useState` and `useEffect` to check for native share support only after component mounts, preventing hydration errors

#### 7. **ArticleSchema** (`src/components/articles/ArticleSchema.tsx`)
- **Purpose:** Schema.org JSON-LD markup for SEO
- **Props:**
  - `article: Article` — Full article data
- **Features:**
  - Article schema with title, author, datePublished, image
  - Open Graph and Twitter Card support
  - Properly formatted JSON-LD

---

## Data Architecture

### TypeScript Interfaces

**Location:** `src/types/articles.ts`

```typescript
export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string; // ISO date string
  featuredImage: string; // URL path
  category: ArticleCategory[];
  tags: string[];
  body: string; // HTML string
  seoTitle?: string;
  seoDescription?: string;
  relatedArticles?: string[]; // Article slugs
}

export interface ArticleMetadata {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  featuredImage: string;
  category: ArticleCategory[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export type ArticleCategory = 
  | 'Skincare Education'
  | 'Well-Aging'
  | "Founder's Notes"
  | 'Rituals & Reflections';
```

### Data Files

**Structure:**
```
data/articles/
├── index.json              # Metadata for all articles
└── [slug].json            # Full article content (e.g., black-dont-crack.json)
```

**Index File** (`data/articles/index.json`):
- Contains array of `ArticleMetadata` objects
- Used for landing page grid and navigation
- Structure: `{ "articles": ArticleMetadata[] }`

**Individual Article Files** (`data/articles/[slug].json`):
- Contains full `Article` object with HTML body content
- Used for individual article pages
- Structure: `Article` object

**Public Directory:**
- `public/data/articles/index.json` — Copy of index for client-side fetching (landing page)

### Data Loading Strategy

**Landing Page** (`/articles/page.tsx`):
- **Client Component:** Uses `useEffect` and `fetch` to load data from `/data/articles/index.json`
- **Reason:** Landing page uses client-side state for filtering and animations

**Individual Article Pages** (`/articles/[slug]/page.tsx`):
- **Server Component:** Uses `fs.readFileSync()` to read JSON files directly
- **Reason:** Server-side rendering for SEO and performance
- **Static Generation:** Uses `generateStaticParams()` to pre-render all articles at build time

**Layout Metadata** (`/articles/[slug]/layout.tsx`):
- **Server Component:** Reads article metadata for SEO tags
- **Dynamic Metadata:** Generates title, description, Open Graph, Twitter cards per article

---

## Features Implemented

### 1. **Articles Landing Page**
- Hero banner with title and tagline
- Responsive article grid (1/2/3 columns)
- Category filtering (conditionally shown)
- Loading states
- Empty states
- Hover animations on cards

### 2. **Individual Article Pages**
- Full-width hero image
- Article title and author line
- HTML body content with prose styling
- Social sharing buttons
- Navigation to previous/next articles (placeholder)
- SEO schema markup
- Disclaimer footer

### 3. **SEO Optimization**
- Dynamic metadata per article
- Schema.org Article markup
- Open Graph tags
- Twitter Card tags
- Keywords metadata
- Proper heading hierarchy (H1, H2, H3)
- Alt text for images

### 4. **Accessibility**
- Semantic HTML (`<article>`, `<nav>`, proper headings)
- Alt text for all images
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus-visible states
- Color contrast compliance (WCAG AA)

### 5. **Performance**
- Next.js Image optimization for hero images
- Static generation for article pages
- Priority loading for above-the-fold content
- Client-side data fetching only where needed

### 6. **Responsive Design**
- Mobile-first approach
- Breakpoints: mobile (default), tablet (md), desktop (lg)
- Flexible grid layouts
- Responsive typography
- Touch-friendly interactive elements

---

## Technical Decisions

### 1. **Client vs Server Components**

**Landing Page (`/articles/page.tsx`):**
- **Client Component:** Needed for:
  - Category filtering state
  - Framer Motion animations
  - Client-side data fetching

**Individual Article Pages (`/articles/[slug]/page.tsx`):**
- **Server Component:** Benefits:
  - SEO (server-rendered HTML)
  - Performance (static generation)
  - Direct file system access

### 2. **Data Fetching Strategy**

**Why Two Approaches?**
- **Landing Page:** Client-side fetching allows for dynamic filtering and better UX
- **Article Pages:** Server-side reading enables static generation and SEO

### 3. **Hydration Safety**

**ArticleShare Component:**
- Problem: Conditional rendering based on `navigator.share` caused hydration mismatch
- Solution: Use `useState` and `useEffect` to check for native share only after mount
- Result: Server and client render same initial HTML, then enhance on client

**ArticleBody Component:**
- Removed `'use client'` directive (not needed)
- Changed from `<article>` to `<div>` to avoid semantic conflicts

### 4. **Category Filter Visibility**

**Conditional Rendering:**
- Filters only show when `categories.length > 1`
- Prevents showing a single filter option (redundant)
- Auto-updates when new categories are added

### 5. **Link Styling**

**Internal Links:**
- "NFE Face Elixir" links to `/products/face-elixir`
- Styled with brand colors (green text, gold underline)
- Hover states for better UX

---

## File Structure

```
src/
├── app/
│   └── articles/
│       ├── page.tsx              # Landing page (client)
│       ├── layout.tsx            # Landing page metadata
│       └── [slug]/
│           ├── page.tsx          # Article page (server)
│           └── layout.tsx        # Article metadata (server)
├── components/
│   └── articles/
│       ├── ArticleCard.tsx       # Article preview card
│       ├── ArticleGrid.tsx       # Grid with filters
│       ├── ArticleHero.tsx       # Hero image
│       ├── ArticleBody.tsx      # HTML content renderer
│       ├── ArticleNavigation.tsx # Prev/Next nav
│       ├── ArticleShare.tsx      # Social sharing
│       └── ArticleSchema.tsx    # SEO schema
├── types/
│   └── articles.ts               # TypeScript interfaces
└── data/
    └── articles/
        ├── index.json            # Article metadata index
        └── black-dont-crack.json # Individual article content

public/
└── data/
    └── articles/
        └── index.json            # Copy for client-side fetch
```

---

## Integration Points

### 1. **Navigation**
- **Primary Navigation:** "Articles" link added to `PrimaryNav.tsx`
- **Route:** `/articles`

### 2. **Sitemap**
- Articles routes added to `src/app/sitemap.ts`
- Dynamic generation for all article slugs

### 3. **SEO Metadata**
- Per-article metadata in `layout.tsx`
- Global metadata in root `layout.tsx`
- Schema.org markup for rich snippets

### 4. **Styling**
- Uses Tailwind CSS with brand color tokens
- Tailwind Typography plugin for prose styling
- Custom color overrides for links and headings

---

## Content Management

### Current Implementation
- **Static JSON Files:** Articles stored as JSON files in `data/articles/`
- **Manual Updates:** Content edited directly in JSON files
- **No CMS Integration:** Currently no headless CMS (future enhancement)

### Article Structure Example

```json
{
  "slug": "black-dont-crack",
  "title": "Black Don't Crack? The Truth About Sunscreen...",
  "excerpt": "For years, many of us believed...",
  "author": "NFE Beauty",
  "date": "2025-11-01",
  "featuredImage": "/articles/sunscreen-hero.png",
  "category": ["Skincare Education"],
  "tags": ["sunscreen", "SPF", "melanated skin", ...],
  "body": "<p>HTML content...</p>",
  "seoTitle": "Black Don't Crack? The Truth... | NFE Beauty",
  "seoDescription": "Melanin is beautiful, but it's not invincible...",
  "relatedArticles": []
}
```

---

## Performance Optimizations

1. **Static Generation:** All article pages pre-rendered at build time
2. **Image Optimization:** Next.js Image component with priority loading
3. **Code Splitting:** Client components loaded only where needed
4. **Minimal JavaScript:** Server components reduce client bundle size
5. **Efficient Data Loading:** Direct file system reads for server components

---

## Accessibility Features

1. **Semantic HTML:** Proper use of `<article>`, `<nav>`, headings
2. **Alt Text:** All images have descriptive alt text
3. **ARIA Labels:** Interactive elements properly labeled
4. **Keyboard Navigation:** All interactive elements keyboard accessible
5. **Focus States:** Visible focus indicators
6. **Color Contrast:** WCAG AA compliant text colors
7. **Screen Reader Support:** Proper heading hierarchy and landmarks

---

## SEO Features

1. **Dynamic Metadata:** Per-article title, description, keywords
2. **Schema.org Markup:** Article schema for rich snippets
3. **Open Graph Tags:** Social media sharing optimization
4. **Twitter Cards:** Twitter-specific metadata
5. **Proper Heading Hierarchy:** H1, H2, H3 structure
6. **Internal Linking:** Links to product pages for SEO value
7. **Sitemap Integration:** All articles included in sitemap

---

## Future Enhancements

### Phase 1 (Near-term)
- [ ] Complete article navigation (prev/next with actual article data)
- [ ] Related articles section
- [ ] Newsletter signup integration
- [ ] Reading time estimation
- [ ] Author pages/bios

### Phase 2 (Medium-term)
- [ ] Headless CMS integration (Sanity, Contentful, or Strapi)
- [ ] Article search functionality
- [ ] Tag-based filtering
- [ ] Article comments (optional)
- [ ] Print-friendly styles

### Phase 3 (Long-term)
- [ ] Article series/collections
- [ ] Video embeds in articles
- [ ] Interactive elements (quizzes, calculators)
- [ ] A/B testing for article layouts
- [ ] Analytics integration for article performance

---

## Known Issues & Solutions

### Issue 1: Hydration Error in ArticleShare
**Problem:** Conditional rendering of native share button caused server/client mismatch.

**Solution:** Use `useState` and `useEffect` to check for native share support only after component mounts.

**Status:** ✅ Fixed

### Issue 2: Category Filter Visibility
**Problem:** Single category filter was redundant.

**Solution:** Conditional rendering based on `categories.length > 1`.

**Status:** ✅ Fixed

### Issue 3: Article Navigation Placeholder
**Problem:** Navigation component exists but shows placeholder data.

**Solution:** Needs integration with article index to fetch previous/next articles.

**Status:** ⚠️ Pending

---

## Testing Checklist

- [x] Landing page loads and displays articles
- [x] Category filtering works (when multiple categories exist)
- [x] Individual article pages render correctly
- [x] SEO metadata is correct
- [x] Images load and display properly
- [x] Links work (internal and external)
- [x] Social sharing buttons function
- [x] Responsive design works on mobile/tablet/desktop
- [x] No hydration errors
- [x] Accessibility audit passes
- [ ] Article navigation (prev/next) - pending

---

## Dependencies

### Core
- **Next.js 14+** — App Router, Image optimization, Metadata API
- **React 18+** — Server and client components
- **TypeScript** — Type safety

### Styling
- **Tailwind CSS** — Utility-first styling
- **@tailwindcss/typography** — Prose styling plugin

### Icons
- **lucide-react** — Icon library (Share2, Instagram, Linkedin, Mail)

### Animations
- **framer-motion** — Landing page animations (optional)

---

## Summary

The NFE Articles section is a fully functional, SEO-optimized editorial platform built with Next.js 14 App Router. It features:

- **Editorial Experience:** Minimalist, luxury design aligned with brand
- **SEO Optimization:** Comprehensive metadata, schema markup, sitemap integration
- **Performance:** Static generation, image optimization, efficient data loading
- **Accessibility:** WCAG AA compliant, semantic HTML, keyboard navigation
- **Scalability:** Ready for CMS integration, extensible component architecture

The implementation follows Next.js 14+ best practices, using server components where possible for performance and SEO, and client components only where interactivity is required. The architecture supports future enhancements including CMS integration, search functionality, and advanced features.

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0  
**Status:** Production Ready (with pending enhancements)









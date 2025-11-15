# NFE "Our Story" Page — Architecture & Implementation Summary

## Overview

The "Our Story" page (`/our-story`) is a personal, founder-focused narrative page that tells Vanessa's journey with NFE. This page replaced the previous research-focused "About" page, providing a more intimate brand story. The implementation includes a full-bleed hero section, narrative storytelling, brand ethos, and integrated video functionality.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Route Structure](#route-structure)
3. [Component Architecture](#component-architecture)
4. [Page Sections](#page-sections)
5. [Video Integration](#video-integration)
6. [Navigation Changes](#navigation-changes)
7. [SEO & Metadata](#seo--metadata)
8. [Design Implementation](#design-implementation)
9. [Technical Decisions](#technical-decisions)
10. [File Structure](#file-structure)
11. [Migration from About Page](#migration-from-about-page)

---

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with custom color tokens
- **Animations**: Framer Motion
- **Image Optimization**: Next.js Image component
- **Video**: YouTube embed with custom lightbox modal
- **Typography**: Garamond Premier Pro (serif) for headings and body text

### Architecture Pattern

**Client-Side Rendered Page** with:
- Server-side metadata via layout
- Client-side interactivity (video lightbox)
- Optimized image loading
- Responsive design (mobile-first)

---

## Route Structure

### Primary Route

**Path**: `/our-story`

**File**: `src/app/our-story/page.tsx`

**Layout**: `src/app/our-story/layout.tsx` (for metadata)

### Redirect Configuration

**File**: `next.config.js`

**Redirect**: `/about` → `/our-story` (temporary redirect, 307 status)

**Rationale**: 
- Preserves SEO value from existing `/about` links
- Prevents broken links
- Seamlessly directs users to the new page

---

## Component Architecture

### Main Page Component

**File**: `src/app/our-story/page.tsx`

**Type**: Client Component (`'use client'`)

**Key Features**:
- State management for video lightbox (`useState`)
- Framer Motion animations for sections
- Next.js Image component for optimized images
- Responsive layout with Tailwind CSS

### Video Lightbox Component

**File**: `src/components/ui/VideoLightbox.tsx`

**Purpose**: Modal overlay for YouTube video playback

**Features**:
- YouTube Shorts URL support
- Keyboard navigation (Escape key)
- Click outside to close
- Responsive 16:9 aspect ratio
- Accessibility (ARIA labels, focus management)
- Body scroll lock when open
- Auto-play on open

**Props**:
```typescript
interface VideoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}
```

**Video URL Handling**:
- Supports YouTube Shorts format: `youtube.com/shorts/VIDEO_ID`
- Supports standard format: `youtube.com/watch?v=VIDEO_ID`
- Supports short format: `youtu.be/VIDEO_ID`
- Converts to embed URL: `youtube.com/embed/VIDEO_ID`

---

## Page Sections

### Section 1: Hero Section

**Purpose**: Full-bleed visual introduction with overlay text

**Implementation**:
- Full viewport height (min-height: 80vh)
- Background image with golden filter
- Frosted overlay (15% opacity) for text readability
- Centered text overlay
- "Play Video" button that opens lightbox

**Image**:
- Path: `/images/products/20251003_175927.jpg`
- Filter: `sepia(20%) saturate(80%) brightness(105%)`
- Overlay: `bg-black/15 mix-blend-multiply`

**Content**:
- Heading: "Vanessa's Story"
- Subheading: "Made for Me. Shared with You."
- CTA: "Play Video ▶︎" button

**Animation**:
- Fade-in with upward motion
- Delay: 0.2s
- Duration: 0.8s

### Section 2: Narrative Block

**Purpose**: Two-column storytelling layout with full narrative text

**Layout**:
- Desktop: Text left (55%), Image right (40%)
- Mobile: Stacked vertically
- Max width: 1200px, centered

**Text Content**:
- Full narrative from architect's specification
- Key quotes highlighted in gold/italic
- Line height: 1.5 (relaxed reading)
- Serif font (Garamond Premier Pro)

**Image**:
- Same image as hero: `/images/products/20251003_175927.jpg`
- Aspect ratio: 4:5
- Filter: `sepia(10%) saturate(90%)`
- Rounded corners, shadow

**Animation**:
- Fade-in with upward motion
- Image delayed by 0.2s for staggered effect

**Key Narrative Points**:
1. Honest skincare philosophy
2. Melasma journey in late forties
3. 2016 origin story (body oil evolution)
4. Well-aging philosophy (not anti-aging)
5. NFE meaning: "Not For Everyone"
6. Smart layers approach (Protect → Treat → Nourish)
7. Closing statement: "Beautiful skin isn't effortless—it's intentional."

### Section 3: Brand Ethos

**Purpose**: Core philosophy statement

**Design**:
- Background: Deep green (#1B3A34 - Pantone 3435 C)
- Text: White with gold accents
- Centered layout
- Max width: 1200px

**Content**:
- Headline: "Honest Skincare. Designed for the Journey." (gold)
- Body: "NFE isn't anti-aging—it's pro-wellness..." (white, 90% opacity)

**Animation**:
- Fade-in with upward motion

### Section 4: Closing CTA

**Purpose**: Drive users to shop

**Design**:
- White background
- Centered layout
- Minimalist design
- Generous whitespace

**Content**:
- Headline: "Discover the Ritual"
- Subtext: "Explore NFE Face and Body Elixirs—the daily nourishment your skin deserves."
- Button: "Shop NFE Elixirs" → links to `/shop`

**Button Styling**:
- Gold background (#D6B370)
- Dark green text (#1B3A34)
- Rounded-full shape
- Shadow with hover effect

**Animation**:
- Fade-in with upward motion

---

## Video Integration

### Hero Section Video Button

**Implementation**:
- Button in hero overlay
- Opens `VideoLightbox` component
- YouTube Short URL: `https://www.youtube.com/shorts/rK3Vc7JcG7M`

**Button Features**:
- Gold background with hover state
- Play icon (Lucide React)
- Accessible (ARIA label)
- Focus states for keyboard navigation

### Video Lightbox Modal

**Features**:
- Full-screen overlay with backdrop
- Centered video container (max-width: 4xl)
- 16:9 aspect ratio
- Auto-play enabled
- Close button (X icon) in top-right
- Keyboard accessible (Escape to close)
- Click outside to close
- Body scroll lock when open

**Accessibility**:
- ARIA labels on all interactive elements
- Focus management (traps focus in modal)
- Keyboard navigation support
- Screen reader friendly

**Animation**:
- Backdrop: Fade in/out (0.2s)
- Modal: Scale + fade (0.3s)

---

## Navigation Changes

### Primary Navigation Update

**File**: `src/components/layout/PrimaryNav.tsx`

**Changes**:
- **Removed**: "About" tab (`/about`)
- **Kept**: "Our Story" tab (`/our-story`)

**Current Navigation Items**:
1. Home (`/`)
2. Our Story (`/our-story`)
3. Science (`/science`)
4. Ingredients (`/inci`)
5. Shop (`/shop`)
6. Focus Group (`/focus-group/login`) - Gold styling

### Redirect Configuration

**File**: `next.config.js`

**Implementation**:
```javascript
async redirects() {
  return [
    {
      source: '/about',
      destination: '/our-story',
      permanent: false, // Temporary redirect (307)
    },
  ];
}
```

**Rationale**:
- Preserves SEO from existing `/about` links
- Prevents 404 errors
- Seamless user experience
- Can be changed to `permanent: true` if this becomes final

### Sitemap Update

**File**: `src/app/sitemap.ts`

**Changes**:
- **Removed**: `/about` entry
- **Kept**: `/our-story` entry (priority: 0.9)

---

## SEO & Metadata

### Page Metadata

**File**: `src/app/our-story/layout.tsx`

**Implementation**:
```typescript
export const metadata: Metadata = {
  title: 'Our Story – NFE Skincare for Mature Melanated Skin',
  description: 'Discover Vanessa\'s journey behind NFE—a skincare line born from honesty, science, and care for mature, melanated skin.',
  openGraph: {
    title: 'Our Story – NFE Skincare for Mature Melanated Skin',
    description: 'Discover Vanessa\'s journey behind NFE—a skincare line born from honesty, science, and care for mature, melanated skin.',
    type: 'website',
  },
};
```

**SEO Elements**:
- Descriptive title tag
- Compelling meta description
- OpenGraph tags for social sharing
- Proper heading hierarchy (H1, H2, H3)
- Semantic HTML structure
- Alt text on all images

---

## Design Implementation

### Color Palette

**Primary Colors**:
- Deep Green: `#1B3A34` (Pantone 3435 C)
- Gold Accent: `#D6B370` / `#E7C686` (Pantone 873 C)
- Cream: `#F8F5F2`
- Soft Charcoal: `#2B2B2B`

**Usage**:
- Hero overlay: White text on dark image
- Brand ethos: White text on deep green background
- CTA: Gold button on white background
- Cards: Dark green (#2A4C44) with gold accents

### Typography

**Headings**: Garamond Premier Pro Bold
- Hero: 4xl-6xl (responsive)
- Section titles: 3xl-4xl
- Card titles: 2xl

**Body**: Garamond Premier Pro Regular
- Size: lg (18px)
- Line height: 1.5 (relaxed)
- Color: #2B2B2B (soft charcoal)

**Accent Text**: Sans-serif (Inter/Lato)
- Used for buttons and UI elements
- Better legibility for small text

### Image Styling

**Hero Image**:
- Full-bleed background
- Golden filter: `sepia(20%) saturate(80%) brightness(105%)`
- Frosted overlay: 15% black with multiply blend mode
- Object-fit: cover
- Priority loading

**Narrative Image**:
- Aspect ratio: 4:5
- Subtle filter: `sepia(10%) saturate(90%)`
- Rounded corners
- Shadow for depth

### Responsive Design

**Breakpoints**:
- Mobile: < 768px (stacked layout)
- Tablet: 768px - 1024px (adjusted columns)
- Desktop: > 1024px (full two-column layout)

**Responsive Features**:
- Text sizes scale (4xl → 5xl → 6xl)
- Columns stack on mobile
- Images maintain aspect ratios
- Video lightbox full-width on mobile

---

## Technical Decisions

### 1. Client Component vs Server Component

**Decision**: Client Component (`'use client'`)

**Rationale**:
- Requires `useState` for video lightbox
- Uses Framer Motion (client-side animations)
- Interactive elements (buttons, modals)

**Trade-off**: Metadata handled via separate layout file

### 2. Image Optimization

**Decision**: Next.js Image component

**Rationale**:
- Automatic image optimization
- Lazy loading (except hero with `priority`)
- Responsive images
- WebP/AVIF format support
- Better performance

**Implementation**:
- Hero: `priority` flag for above-fold
- Narrative: Standard lazy loading
- `fill` prop for responsive sizing
- `object-cover` for proper cropping

### 3. Video Lightbox vs Inline Embed

**Decision**: Lightbox modal (removed duplicate inline embed)

**Rationale**:
- Cleaner page design
- Better user experience (on-demand viewing)
- Reduces initial page load
- More engaging interaction

**Implementation**:
- Button in hero opens modal
- Removed duplicate embed section
- Single video access point

### 4. Redirect Strategy

**Decision**: Temporary redirect (307) from `/about` to `/our-story`

**Rationale**:
- Preserves SEO value
- Prevents broken links
- Allows for future changes
- Can be made permanent later

### 5. Navigation Removal

**Decision**: Remove "About" tab, keep "Our Story"

**Rationale**:
- Avoids confusion (two similar pages)
- "Our Story" is more personal and engaging
- Cleaner navigation
- Redirect handles legacy links

---

## File Structure

```
src/
├── app/
│   ├── our-story/
│   │   ├── layout.tsx          # SEO metadata
│   │   └── page.tsx            # Main page component
│   └── about/
│       └── page.tsx            # Legacy page (still exists, redirects)
│
├── components/
│   ├── ui/
│   │   └── VideoLightbox.tsx  # Video modal component
│   └── layout/
│       └── PrimaryNav.tsx      # Navigation (updated)
│
└── public/
    └── images/
        └── products/
            └── 20251003_175927.jpg  # Hero/narrative image

next.config.js                  # Redirect configuration
src/app/sitemap.ts             # Sitemap (updated)
```

---

## Migration from About Page

### Previous About Page

**Path**: `/about`

**Content**: Research-focused, community-oriented
- Mission & Origin
- Scientific Approach
- Technology & Accessibility
- Team Section
- Compliance & Trust
- Contact Information

**Status**: Still exists but redirects to `/our-story`

### New Our Story Page

**Path**: `/our-story`

**Content**: Personal, founder-focused narrative
- Hero with personal photo
- Personal journey story
- Brand philosophy
- Video from founder
- Shop CTA

**Rationale for Change**:
- More personal and authentic
- Better brand storytelling
- Aligns with "Made for Me. Shared with You." tagline
- More engaging for potential customers

### Migration Steps Completed

1. ✅ Created new `/our-story` page
2. ✅ Removed "About" from navigation
3. ✅ Added redirect from `/about` to `/our-story`
4. ✅ Updated sitemap
5. ✅ Added SEO metadata
6. ✅ Implemented video lightbox
7. ✅ Added product images

---

## Features Implemented

### ✅ Hero Section
- Full-bleed background image
- Golden filter effect
- Frosted overlay for text readability
- Centered text overlay
- "Play Video" button
- Responsive design (80vh minimum height)

### ✅ Narrative Section
- Two-column layout (desktop)
- Full story text with highlighted quotes
- Side-by-side image
- Responsive stacking (mobile)
- Fade-in animations

### ✅ Brand Ethos Section
- Deep green background
- Gold accent text
- Centered philosophy statement
- Clean, minimalist design

### ✅ CTA Section
- "Discover the Ritual" heading
- Product description
- Shop button linking to `/shop`
- White background with generous spacing

### ✅ Video Integration
- Lightbox modal component
- YouTube Shorts support
- Keyboard navigation
- Accessibility features
- Auto-play on open

### ✅ Navigation Updates
- Removed "About" tab
- Kept "Our Story" tab
- Redirect configuration
- Sitemap updates

### ✅ SEO & Metadata
- Descriptive title and description
- OpenGraph tags
- Proper heading hierarchy
- Alt text on images

---

## Accessibility Features

### Keyboard Navigation
- All interactive elements keyboard accessible
- Escape key closes video lightbox
- Focus management in modal
- Focus-visible states on buttons

### Screen Reader Support
- ARIA labels on buttons and modals
- Semantic HTML structure
- Proper heading hierarchy
- Alt text on all images

### Visual Accessibility
- High contrast text (white on dark, dark on light)
- Readable font sizes (minimum 18px body)
- Sufficient spacing between elements
- Clear focus indicators

---

## Performance Optimizations

### Image Optimization
- Next.js Image component with automatic optimization
- Priority loading for hero image
- Lazy loading for below-fold images
- WebP/AVIF format support
- Responsive image sizing

### Animation Performance
- Framer Motion with GPU acceleration
- Staggered animations for better perceived performance
- Reduced motion support (via CSS)

### Code Splitting
- Client component for interactivity
- Server component for metadata
- Lazy loading of video embed

---

## Future Enhancements

### Potential Improvements

1. **Image Optimization**
   - Convert to WebP format
   - Generate blur placeholders
   - Add responsive image sizes

2. **Video Enhancements**
   - Add video captions
   - Multiple video support
   - Video analytics

3. **Content Management**
   - Make content editable via CMS
   - Dynamic image selection
   - A/B testing capabilities

4. **Analytics**
   - Track video play events
   - Monitor scroll depth
   - Measure CTA clicks

5. **Internationalization**
   - Multi-language support
   - Localized content
   - RTL support

---

## Testing Checklist

### Functionality
- [x] Hero section displays correctly
- [x] Video lightbox opens and closes
- [x] Navigation redirects work
- [x] All links function properly
- [x] Images load correctly
- [x] Animations work smoothly

### Responsive Design
- [x] Mobile layout (stacked)
- [x] Tablet layout (adjusted columns)
- [x] Desktop layout (two-column)
- [x] Images scale properly
- [x] Text remains readable

### Accessibility
- [x] Keyboard navigation works
- [x] Screen reader compatible
- [x] Focus indicators visible
- [x] Alt text on images
- [x] ARIA labels present

### SEO
- [x] Metadata configured
- [x] Sitemap updated
- [x] Redirect working
- [x] Proper heading hierarchy
- [x] Semantic HTML

---

## Troubleshooting

### Common Issues

**Image Not Loading**:
- Verify file exists at `/public/images/products/20251003_175927.jpg`
- Check file permissions
- Clear Next.js cache (`.next` folder)
- Hard refresh browser (Ctrl+F5)

**Video Lightbox Not Opening**:
- Check browser console for errors
- Verify YouTube URL is correct
- Ensure VideoLightbox component is imported
- Check state management (isVideoOpen)

**Redirect Not Working**:
- Restart development server (next.config.js changes require restart)
- Clear browser cache
- Verify redirect configuration syntax

**Styling Issues**:
- Check Tailwind classes are correct
- Verify custom colors in tailwind.config
- Ensure Framer Motion is installed
- Check for CSS conflicts

---

## Summary

The "Our Story" page represents a complete redesign of the brand's narrative presentation, moving from a research-focused "About" page to a personal, founder-driven story. The implementation includes:

- **Full-bleed hero section** with optimized images and video integration
- **Two-column narrative layout** with personal storytelling
- **Brand ethos section** with clear philosophy statement
- **Video lightbox modal** for engaging video content
- **Seamless navigation** with redirect from old `/about` route
- **SEO optimization** with proper metadata and sitemap
- **Accessibility features** for inclusive user experience
- **Performance optimizations** for fast loading

The page successfully communicates Vanessa's personal journey with NFE while maintaining professional design standards and technical best practices. The migration from the old "About" page is complete, with all legacy links properly redirected to the new "Our Story" page.









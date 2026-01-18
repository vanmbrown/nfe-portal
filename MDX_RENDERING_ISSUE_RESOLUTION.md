# MDX Rendering Issue Resolution - Complete Documentation

## Executive Summary

This document details the complete journey of resolving MDX rendering issues where custom JSX components (`<KeyTakeaways />`, `<TwoCol />`, etc.) were appearing as raw text in production instead of rendering as React components. The issue involved migrating from a runtime filesystem-based approach to a build-time static import approach using `@next/mdx`.

**Current Status**: MDX compilation and component mapping are correctly configured. However, article routes are returning 404 errors in production, indicating a deployment/routing issue with Cloudflare Workers + OpenNext.

---

## Initial Problem Statement

### Symptoms
- Article pages in production displayed raw JSX tags as text:
  - `<KeyTakeaways items={[...]} />` appeared literally on the page
  - `<TwoCol left={...} right={...} />` appeared literally on the page
  - Other custom MDX components (`<Callout />`, `<Divider />`) also rendered as raw text

### Root Cause Analysis

The original implementation had multiple issues:

1. **Runtime Filesystem Access**: Articles were loaded using `fs.readFileSync()` at runtime, which doesn't work in Cloudflare Workers (no filesystem access).

2. **MDX → HTML String Conversion**: The code was using `remark-html` to convert MDX/Markdown to HTML strings, then rendering via `dangerouslySetInnerHTML`. This approach:
   - Doesn't execute MDX JSX components (they become plain text)
   - Bypasses React component rendering
   - Causes raw JSX tags to appear in output

3. **Missing MDX Compilation**: MDX files weren't being processed by Next.js MDX loader, so JSX inside MDX wasn't being compiled to React components.

4. **React Element Mismatch**: Attempts to use `next-mdx-remote/rsc` during prerendering caused "React Element from an older version of React" errors.

---

## Solution Architecture

### Target Solution: Build-Time Static Imports with @next/mdx

The solution involves:
1. **Static MDX Imports**: Import MDX files at build time (bundled into the build)
2. **@next/mdx Integration**: Use Next.js's official MDX support
3. **Component Mapping**: Map MDX JSX tags to React components via `mdx-components.tsx`
4. **SSG (Static Site Generation)**: Pre-render all articles at build time
5. **No Runtime Filesystem**: All content is bundled, no `fs` calls at runtime

---

## Implementation Steps Taken

### Step 1: Configure @next/mdx

**File**: `next.config.mjs` (migrated from `next.config.js`)

**Changes**:
- Added `@next/mdx` integration using `createMDX`
- Configured to handle both `.mdx` and `.md` files
- Set `pageExtensions` to include `"md"` and `"mdx"`

**Code**:
```javascript
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // ... rest of config
};

export default withMDX(nextConfig);
```

**Status**: ✅ Complete

---

### Step 2: Create MDX Component Mapping

**File**: `src/mdx-components.tsx` (new file)

**Purpose**: Required by Next.js App Router to map MDX JSX tags to React components.

**Implementation**:
```typescript
import type { MDXComponents } from "mdx/types";
import {
  Callout,
  Divider,
  KeyTakeaways,
  TwoCol,
} from "@/components/articles/MDXComponents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    Divider,
    KeyTakeaways,
    TwoCol,
  };
}
```

**Status**: ✅ Complete

---

### Step 3: Create Static Import Registry

**File**: `src/content/articles/registry.ts` (new file)

**Purpose**: Replace runtime filesystem access with build-time static imports.

**Implementation**:
```typescript
export const articleMDX = {
  "clean-beauty-myths-future-nfe": () =>
    import("./clean-beauty-myths-future-nfe.mdx"),
  "ingredient-translation-brightening-melanated-skin": () =>
    import("./ingredient-translation-brightening-melanated-skin.mdx"),
  "refill-culture-quiet-sustainable-luxury": () =>
    import("./refill-culture-quiet-sustainable-luxury.mdx"),
  "barrier-wealth-aging-melanated-skin": () =>
    import("./why_aging_melanated_skin_ages_differently.mdx"),
  "barrier-wealth-midlife-dryness-after-45": () =>
    import("./drier_skin_after_45.mdx"),
  "black-dont-crack": () => import("./black-dont-crack.md"),
  "water-vs-oil": () => import("./water-vs-oil.md"),
} as const;

export type ArticleSlug = keyof typeof articleMDX;
export const allArticleSlugs = Object.keys(articleMDX) as ArticleSlug[];
```

**Benefits**:
- MDX files are bundled at build time
- No runtime filesystem access needed
- Works in Cloudflare Workers environment
- Type-safe slug references

**Status**: ✅ Complete

---

### Step 4: Refactor Article Page to Use MDX Components

**File**: `src/app/articles/[slug]/page.tsx`

**Key Changes**:

1. **Removed**:
   - `dangerouslySetInnerHTML` usage
   - `remark-html` processing
   - `getArticleBySlug()` function that used `fs.readFileSync()`
   - `next-mdx-remote` imports

2. **Added**:
   - Static import from registry
   - Direct MDX component rendering
   - SSG configuration (`force-static`, `dynamicParams=false`, `revalidate=false`)
   - `generateStaticParams()` using registry

**Implementation**:
```typescript
import { articleMDX, allArticleSlugs, type ArticleSlug } from "@/content/articles/registry";
import articlesIndex from "@/content/articles/articles.json";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return allArticleSlugs.map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const typedSlug = slug as ArticleSlug;
  const loader = articleMDX[typedSlug];
  
  if (!loader) {
    notFound();
  }

  const mod = await loader();
  const MDXContent = mod.default; // MDX component

  return (
    <article>
      {/* ... metadata ... */}
      <MDXContent /> {/* Renders MDX as React components */}
    </article>
  );
}
```

**Status**: ✅ Complete

---

### Step 5: Update Articles Library

**File**: `src/lib/articles.ts`

**Changes**:
- Removed `getArticleBySlug()` function that used `fs.readFileSync()`
- Now only reads metadata from `articles.json` (static JSON import)
- No longer processes MDX/Markdown content (handled by registry imports)

**Status**: ✅ Complete

---

### Step 6: Clean Up MDX Files

**Files**: All `.mdx` files in `src/content/articles/`

**Changes**:
- Removed inline `export const KeyTakeaways = ...` component definitions
- Removed inline `export const TwoCol = ...` component definitions
- Removed inline `export const Callout = ...` component definitions
- Removed inline `export const Divider = ...` component definitions
- Components are now only defined in `src/components/articles/MDXComponents.tsx`
- MDX files now use `<KeyTakeaways />`, `<TwoCol />`, etc. as JSX tags (resolved via `mdx-components.tsx`)

**Status**: ✅ Complete

---

### Step 7: Add Build Marker for Verification

**File**: `src/app/articles/[slug]/page.tsx`

**Purpose**: Verify which build is actually deployed in production.

**Implementation**:
```typescript
{process.env.NEXT_PUBLIC_BUILD_SHA && (
  <p className="text-xs text-gray-400 mb-2" data-build-sha={process.env.NEXT_PUBLIC_BUILD_SHA}>
    Build: {process.env.NEXT_PUBLIC_BUILD_SHA}
  </p>
)}
```

**Deployment Command**:
```powershell
$env:NEXT_PUBLIC_BUILD_SHA = (git rev-parse --short HEAD)
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN"
npm run deploy
```

**Status**: ✅ Complete

---

## Build Verification

### Local Build Status

**Command**: `npm run build`

**Output**:
```
Route (app)
├ ● /articles/[slug]
│ ├ /articles/clean-beauty-myths-future-nfe
│ ├ /articles/ingredient-translation-brightening-melanated-skin
│ ├ /articles/refill-culture-quiet-sustainable-luxury
│ └ [+4 more paths]
```

**Status**: ✅ **SSG (●)** - All article routes are statically generated

---

## Current Issues

### Issue 1: 404 Errors on Article Routes in Production

**Symptom**: Article URLs return 404 in production (Cloudflare Workers deployment)

**Example URL**: `https://nfe-portal.vanessa-mccaleb.workers.dev/articles/refill-culture-quiet-sustainable-luxury`

**Root Cause Analysis**:
1. **OpenNext Build Output**: OpenNext build shows articles are being generated:
   ```
   ├ ● /articles/[slug]
   │ ├ /articles/clean-beauty-myths-future-nfe
   │ ├ /articles/ingredient-translation-brightening-melanated-skin
   │ └ ...
   ```

2. **Assets Directory**: The `.open-next/assets` directory exists and contains 234 files, but article HTML files are not present in the assets directory.

3. **Possible Causes**:
   - OpenNext may be handling SSG routes via Worker handler (dynamic) rather than static files
   - Static HTML files may not be copied to assets directory during build
   - Worker routing may not be configured to serve these routes
   - Wrangler assets configuration may be incorrect

**Attempted Fixes**:

1. **Updated `wrangler.jsonc`**:
   ```jsonc
   {
     "assets": {
       "directory": ".open-next/assets",
       "not_found_handling": "404-page",
       "html_handling": "auto-trailing-slash"
     }
   }
   ```
   **Result**: No change - still 404

2. **Updated `open-next.config.ts`**:
   - Initially tried `runWorkerFirst: false` (invalid option - caused build error)
   - Reverted to minimal config: `export default defineCloudflareConfig({});`
   **Result**: Build succeeds, but 404 persists

**Current Status**: 🔴 **Unresolved** - Requires further investigation

**Next Steps for Architect**:
1. Verify OpenNext Cloudflare adapter behavior for SSG routes
2. Check if static HTML files need to be manually copied to assets directory
3. Review Worker routing configuration
4. Check Cloudflare Workers logs to see what happens when article URL is requested
5. Consider if SSG routes should be handled dynamically by Worker instead of as static files

---

## Configuration Files

### `next.config.mjs`
```javascript
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // ... rest of config
};

export default withMDX(nextConfig);
```

### `open-next.config.ts`
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({});
```

### `wrangler.jsonc`
```jsonc
{
  "name": "nfe-portal",
  "main": ".open-next/worker.js",
  "assets": {
    "directory": ".open-next/assets",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  },
  "compatibility_date": "2026-01-18",
  "compatibility_flags": ["nodejs_compat"]
}
```

### `package.json` Scripts
```json
{
  "scripts": {
    "build": "next build --webpack",
    "build:worker": "opennextjs-cloudflare build",
    "deploy": "opennextjs-cloudflare build && npx wrangler deploy .open-next/worker.js"
  }
}
```

---

## Dependencies

### Added
- `@next/mdx`: ^16.1.3 (Next.js MDX support)
- `@opennextjs/cloudflare`: ^1.14.9 (OpenNext Cloudflare adapter)
- `wrangler`: ^4.59.2 (Cloudflare Workers CLI)

### Removed
- `next-mdx-remote`: No longer needed (using @next/mdx instead)
- `remark-html`: No longer needed (MDX renders as components, not HTML strings)

### Kept (Still Used)
- `remark`: ^15.0.1 (used by @next/mdx internally)
- `@mdx-js/mdx`: ^3.1.1 (used by @next/mdx internally)
- `@mdx-js/react`: ^3.1.1 (used by @next/mdx internally)

---

## Testing & Verification Checklist

### ✅ Completed
- [x] Local build succeeds
- [x] `/articles/[slug]` routes show as SSG (●) in build output
- [x] MDX component mapping configured (`mdx-components.tsx`)
- [x] Static import registry created
- [x] Article page refactored to use MDX components
- [x] No runtime filesystem access
- [x] Build marker added for deployment verification
- [x] Wrangler assets configuration updated

### 🔴 Pending
- [ ] Article routes accessible in production (currently 404)
- [ ] MDX components render correctly in production (cannot verify due to 404)
- [ ] Build marker visible in production (cannot verify due to 404)
- [ ] No raw JSX tags in production HTML source (cannot verify due to 404)

---

## Architecture Decisions

### Why @next/mdx Instead of next-mdx-remote?

1. **Build-Time Compilation**: `@next/mdx` compiles MDX at build time, bundling everything into the build output. This works in serverless/edge environments.

2. **No Runtime Processing**: `next-mdx-remote` requires runtime processing, which can cause React element mismatch errors during prerendering.

3. **Official Support**: `@next/mdx` is the official Next.js MDX solution, better maintained and integrated.

4. **Component Mapping**: `@next/mdx` with `mdx-components.tsx` provides clean component mapping for App Router.

### Why Static Imports Instead of Filesystem?

1. **Cloudflare Workers Limitation**: Workers don't have filesystem access, so `fs.readFileSync()` fails at runtime.

2. **Build-Time Bundling**: Static imports ensure all MDX content is bundled at build time, making it available in the Worker bundle.

3. **Type Safety**: TypeScript can verify that all slugs in the registry exist.

4. **Performance**: No runtime file I/O, faster page loads.

### Why SSG (force-static)?

1. **Performance**: Pre-rendered pages load instantly.

2. **SEO**: Search engines can crawl static HTML.

3. **Edge Compatibility**: Static files can be served from CDN edge locations.

4. **Cost**: No compute needed for static pages.

---

## Known Limitations & Considerations

1. **Article Updates**: Adding new articles requires:
   - Adding MDX file to `src/content/articles/`
   - Adding entry to `src/content/articles/registry.ts`
   - Adding metadata to `src/content/articles/articles.json`
   - Rebuilding and redeploying

2. **Dynamic Content**: Articles are fully static. If dynamic content is needed (e.g., comments, views), it must be loaded client-side via API.

3. **Windows Compatibility**: OpenNext shows warnings about Windows compatibility. For production builds, consider using WSL or CI/CD pipeline.

---

## Recommendations for Architect Review

### Priority 1: Resolve 404 Issue

**Questions to Investigate**:
1. How does OpenNext Cloudflare adapter handle SSG routes?
   - Are they supposed to be static files in assets directory?
   - Or handled dynamically by Worker handler?

2. Should we manually copy static HTML files to assets directory?
   - Check if OpenNext provides a hook/script for this
   - Or if we need a post-build step

3. Is Worker routing correctly configured?
   - Check Cloudflare Workers dashboard → Routes
   - Verify Worker is attached to correct domain/pattern

4. What do Worker logs show?
   - Check Cloudflare Workers dashboard → Logs
   - See what happens when article URL is requested

### Priority 2: Verify MDX Rendering

Once 404 is resolved:
1. Verify build marker appears on article pages
2. Check page source for raw JSX tags (should be none)
3. Verify MDX components render as styled UI elements

### Priority 3: Performance Optimization

1. Consider adding ISR (Incremental Static Regeneration) if articles update frequently
2. Implement proper caching headers for static assets
3. Consider CDN caching strategy for article pages

---

## Related Files

### Core Implementation Files
- `src/app/articles/[slug]/page.tsx` - Article page component
- `src/content/articles/registry.ts` - Static import registry
- `src/mdx-components.tsx` - MDX component mapping
- `src/lib/articles.ts` - Article metadata utilities
- `next.config.mjs` - Next.js + MDX configuration
- `open-next.config.ts` - OpenNext Cloudflare configuration
- `wrangler.jsonc` - Cloudflare Workers configuration

### MDX Content Files
- `src/content/articles/*.mdx` - MDX article files
- `src/content/articles/*.md` - Markdown article files
- `src/content/articles/articles.json` - Article metadata

### Component Files
- `src/components/articles/MDXComponents.tsx` - MDX component definitions

---

## Deployment Process

### Current Deployment Command
```powershell
# Set build SHA for verification
$env:NEXT_PUBLIC_BUILD_SHA = (git rev-parse --short HEAD)

# Set Cloudflare API token
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN"

# Build and deploy
npm run deploy
```

### What `npm run deploy` Does
1. Runs `opennextjs-cloudflare build`:
   - Runs `next build --webpack`
   - Processes OpenNext Cloudflare adapter
   - Generates `.open-next/` directory with Worker code and assets
2. Runs `npx wrangler deploy .open-next/worker.js`:
   - Deploys Worker to Cloudflare
   - Uploads assets from `.open-next/assets`

---

## Conclusion

The MDX rendering architecture has been successfully migrated to use build-time static imports with `@next/mdx`. The code is correctly configured and builds successfully locally. However, article routes are returning 404 errors in production, indicating a deployment/routing issue that requires architect review.

**Next Critical Step**: Resolve the 404 issue to verify that MDX components render correctly in production and that the solution works end-to-end.

---

## Contact & Questions

For questions about this implementation, please refer to:
- This document for complete context
- Git commit history for detailed changes
- Cloudflare Workers dashboard for deployment status
- OpenNext documentation: https://opennext.js.org/cloudflare

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-18  
**Status**: MDX Implementation Complete, Production 404 Issue Pending Resolution

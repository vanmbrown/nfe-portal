# MDX Verification Deployment Guide

## Build Marker Status

✅ Build marker has been added to `src/app/articles/[slug]/page.tsx`
✅ Local build verified: `/articles/[slug]` is SSG (●)
✅ Marker code is in place and will appear when `NEXT_PUBLIC_BUILD_SHA` is set

## Deployment Steps (Windows PowerShell)

### 1. Set Build SHA Environment Variable

```powershell
# Option A: Use git commit SHA (recommended)
$env:NEXT_PUBLIC_BUILD_SHA = (git rev-parse --short HEAD)

# Option B: Use timestamp
$env:NEXT_PUBLIC_BUILD_SHA = (Get-Date).ToString("yyyyMMdd-HHmmss")
```

### 2. Set Cloudflare API Token

```powershell
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN_HERE"
```

### 3. Deploy to Workers

```powershell
npm run deploy
```

This will:
- Run `opennextjs-cloudflare build` (which runs `next build` with the env var)
- Deploy via `wrangler deploy .open-next/worker.js`

## Verification Checklist

After deployment, verify the following:

### ✅ Visual Check (Browser)
1. Open an article URL in **incognito mode**:
   - Example: `https://nfe-portal.vanessa-mccaleb.workers.dev/articles/refill-culture-quiet-sustainable-luxury`
2. Look for the build marker near the article title:
   - Should show: `Build: <sha>` (e.g., `Build: 4f0903d`)
3. Check that MDX components render correctly:
   - No raw `<KeyTakeaways .../>` or `<TwoCol .../>` text visible
   - Components should render as styled UI elements

### ✅ Source Code Check (Critical)
1. **View page source** (Ctrl+U or Right-click → View Page Source)
2. Search for the build marker:
   - Should find: `data-build-sha="<sha>"` or `Build: <sha>`
3. **Search for raw JSX tags**:
   - Search for: `<TwoCol`
   - Search for: `<KeyTakeaways`
   - **If found**: MDX compilation/mapping is NOT working
   - **If not found**: MDX is compiling correctly ✅

## Troubleshooting

### Build Marker Not Visible
- **Cause**: `NEXT_PUBLIC_BUILD_SHA` not set during build
- **Fix**: Ensure env var is set before running `npm run deploy`

### Raw JSX Tags in Page Source
If you see `<TwoCol ...>` or `<KeyTakeaways ...>` in the HTML source:

1. **MDX not being processed**
   - Check `next.config.mjs` has `createMDX` configured
   - Verify `pageExtensions` includes `"md"` and `"mdx"`

2. **Component mapping not working**
   - Verify `src/mdx-components.tsx` exists
   - Check it exports `useMDXComponents` with `TwoCol`, `KeyTakeaways`, etc.

3. **Wrong build deployed**
   - Check Cloudflare Workers dashboard → Deployments
   - Verify latest deployment timestamp matches your deploy time
   - Redeploy if needed

### 404 on Article Pages
- **Cause**: Article slug not in registry or not built
- **Fix**: Check `src/content/articles/registry.ts` includes the slug
- Verify `generateStaticParams()` returns the slug

## Current Status

- ✅ Build marker code: Added
- ✅ MDX component mapping: Configured (`src/mdx-components.tsx`)
- ✅ Article registry: Created (`src/content/articles/registry.ts`)
- ✅ SSG configuration: `force-static`, `dynamicParams=false`, `revalidate=false`
- ✅ No `dangerouslySetInnerHTML` or `remark-html` in article rendering
- ⏳ **Next**: Deploy with `NEXT_PUBLIC_BUILD_SHA` set and verify live

# Cloudflare Pages Build Fix - Next.js 16

## Issue
All deployments showing "No deployment available" with warning status - builds are failing.

## Common Causes & Solutions

### 1. Check Build Logs First
**Most Important Step:**
- Click "View details" on the most recent failed deployment
- Look at the build logs to see the exact error
- Common errors will be listed below, but the logs will tell you exactly what's wrong

### 2. Next.js 16 on Cloudflare Pages

Next.js 16 requires the `@cloudflare/next-on-pages` adapter for Cloudflare Pages.

#### Solution A: Use Cloudflare Next.js Adapter (Recommended)

1. **Install the adapter:**
   ```bash
   npm install --save-dev @cloudflare/next-on-pages
   ```

2. **Update your build script in `package.json`:**
   ```json
   "build": "next build && npx @cloudflare/next-on-pages"
   ```

3. **Update Cloudflare Pages build settings:**
   - **Build command**: `npm run build`
   - **Build output directory**: `.vercel/output/static` (or check what the adapter outputs)

#### Solution B: Use Static Export (Alternative)

If the adapter doesn't work, you can use static export:

1. **Update `next.config.js`:**
   ```js
   const nextConfig = {
     output: 'export',
     // ... rest of your config
   };
   ```

2. **Update Cloudflare Pages build settings:**
   - **Build command**: `npm run build`
   - **Build output directory**: `out`

**Note:** Static export won't work if you have:
- API routes that need server-side execution
- Dynamic routes that require server rendering
- Authentication that relies on server-side sessions

### 3. Verify Build Settings in Cloudflare

Go to: **Pages → nfe-portal → Settings → Builds & deployments**

Check:
- [ ] **Build command**: Should be `npm run build` (or with adapter: `npm run build`)
- [ ] **Build output directory**: 
  - If using adapter: `.vercel/output/static` or `.vercel/output`
  - If using static export: `out`
  - If standard Next.js: `.next` (may not work on Cloudflare)
- [ ] **Root directory**: `/` (or leave empty)
- [ ] **Node version**: `18` or `20` (check `package.json` engines if specified)

### 4. Environment Variables

Ensure all required environment variables are set:
- [ ] Go to **Settings → Environment Variables**
- [ ] Verify Production environment has all variables
- [ ] Check that variable names match exactly (case-sensitive)

### 5. Check Node Version Compatibility

Your `package.json` shows Next.js 16.1.3 which requires Node 18.17+ or Node 20+.

In Cloudflare Pages settings:
- [ ] Set Node version to `20` (recommended) or `18`

### 6. Common Build Errors

#### Error: "Cannot find module"
- **Fix**: Ensure `package-lock.json` is committed to Git
- **Fix**: Check that all dependencies are in `dependencies`, not just `devDependencies`

#### Error: "Build timeout"
- **Fix**: Cloudflare Pages has a 20-minute build timeout
- **Fix**: Optimize build (remove unnecessary dependencies, use smaller images)

#### Error: "Sharp" or image processing errors
- **Fix**: `sharp` is in dependencies (good), but Cloudflare may need it configured differently
- **Fix**: Consider using Cloudflare Image Resizing instead of Next.js Image Optimization

#### Error: "ESM/CommonJS" module errors
- **Fix**: Check `package.json` for `"type": "module"` - Next.js typically doesn't need this

### 7. Quick Test: Build Locally First

Before deploying, test the build locally:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# If using adapter:
npm run build && npx @cloudflare/next-on-pages

# Check output directory exists
ls -la .vercel/output/static  # or 'out' if static export
```

If local build fails, fix those errors first.

## Recommended Action Plan

1. **Click "View details" on the failed deployment** → Read the error message
2. **If error mentions Next.js or build output:**
   - Install `@cloudflare/next-on-pages` adapter
   - Update build command and output directory
3. **If error is about dependencies:**
   - Ensure `package-lock.json` is committed
   - Verify Node version in Cloudflare settings
4. **Test build locally** before pushing
5. **Retry deployment** after fixes

## Next Steps

After you check the build logs, share the error message and I can provide a more specific fix!

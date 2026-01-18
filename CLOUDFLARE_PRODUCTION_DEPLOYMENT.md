# Cloudflare Production Deployment Checklist - nfebeuty.com

## Pre-Deployment Checklist

### 1. Build Verification
- [ ] Run `npm run build` locally to ensure build succeeds
- [ ] Verify no build errors or warnings
- [ ] Test production build locally: `npm start`

### 2. Environment Variables (Cloudflare Dashboard)
Ensure these are set in your Cloudflare Pages project settings:

**Required Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - **PRIVATE** - Service role key (never exposed to client)
- [ ] `ADMIN_EMAILS` - Comma-separated list of admin emails
- [ ] `RESEND_API_KEY` - Resend API key for email
- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis URL (if using rate limiting)
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token (if using rate limiting)
- [ ] `NEXT_PUBLIC_SITE_URL` - Set to `https://nfebeuty.com`

### 3. Cloudflare Pages Deployment

#### Option A: Git Integration (Recommended)
- [ ] Go to Cloudflare Dashboard → Pages → Your Project
- [ ] Ensure connected to correct Git branch (usually `main`)
- [ ] Trigger new deployment or wait for auto-deploy on push
- [ ] Verify build completes successfully

#### Option B: Manual Deployment
- [ ] Run `npm run build` locally
- [ ] Upload `.next` folder and other required files via Cloudflare Dashboard
- [ ] Or use Wrangler CLI: `npx wrangler pages deploy .next`

### 4. Build Configuration (Cloudflare Pages Settings)
- [ ] **Build command**: `npm run build`
- [ ] **Build output directory**: `.next`
- [ ] **Node version**: 18.x or 20.x (check your package.json requirements)
- [ ] **Root directory**: `/` (or leave empty if repo root)

### 5. Custom Domain Configuration
- [ ] Add custom domain `nfebeuty.com` in Cloudflare Pages settings
- [ ] Configure DNS records:
  - [ ] CNAME record: `nfebeuty.com` → `your-project.pages.dev`
  - [ ] Or use Cloudflare's automatic DNS setup
- [ ] Enable SSL/TLS (should be automatic with Cloudflare)
- [ ] Verify domain is active and SSL certificate is issued

### 6. Caching Configuration (Critical)

Based on your `Deployment_Handover.md`, configure these caching rules:

#### Static Assets (Cache Aggressively)
- [ ] `/_next/static/*` - Cache for 1 year
- [ ] `/images/*` - Cache for 1 year
- [ ] `/fonts/*` - Cache for 1 year

#### Dynamic/Protected Routes (No Cache)
- [ ] `/focus-group/*` - **No-Store, Must-Revalidate** (respects `force-dynamic`)
- [ ] `/focus-group/admin/*` - **No-Store, Must-Revalidate**
- [ ] `/api/focus-group/feedback/get` - **No-Store**

#### API Routes (Selective Caching)
- [ ] `/api/products/*` - Cacheable (infrequent changes)
- [ ] `/api/focus-group/*` - No-Store (protected routes)

**How to configure in Cloudflare:**
1. Go to Pages → Your Project → Settings → Functions
2. Or use Cloudflare Dashboard → Rules → Page Rules
3. Or configure in `_headers` file in `public/` directory

### 7. Post-Deployment Verification

#### Smoke Tests
- [ ] Visit `https://nfebeuty.com` - homepage loads
- [ ] Test public pages: `/products`, `/articles`, `/our-story`
- [ ] Verify images load correctly
- [ ] Check browser console for errors

#### Authentication Tests
- [ ] Visit `/focus-group/login` - login page loads
- [ ] Test login flow - redirects work correctly
- [ ] Test protected route access - `/focus-group/profile`
- [ ] Test admin access - `/focus-group/admin` (with admin account)

#### API Tests
- [ ] Test public API endpoints (if any)
- [ ] Test protected API endpoints with auth
- [ ] Verify rate limiting is active (if configured)

#### Performance Checks
- [ ] Run Lighthouse audit on production
- [ ] Verify page load times < 3 seconds
- [ ] Check Core Web Vitals in Cloudflare Analytics

### 8. Monitoring Setup
- [ ] Enable Cloudflare Analytics for the Pages project
- [ ] Set up error notifications (if available)
- [ ] Monitor Supabase connection pool usage
- [ ] Check Resend email delivery rates

### 9. Security Verification
- [ ] Verify SSL certificate is active (green lock in browser)
- [ ] Test that protected routes return 401/403 for unauthorized access
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is NOT exposed in client bundle
- [ ] Check that admin routes are properly protected

## Important Notes from Deployment Handover

### Caching Warnings
⚠️ **Critical**:** The following pages use `force-dynamic` and must NOT be cached as HTML:
- `src/app/focus-group/layout.tsx`
- `src/app/focus-group/admin/layout.tsx`

If these are cached, users might see stale authentication state or protected content.

### No Middleware
- Your app has no `middleware.ts` file
- Route protection is handled at component level
- This simplifies Cloudflare Workers setup but requires careful caching rules

### Image Optimization
- App uses `next/image` component
- Consider enabling Cloudflare Image Resizing if performance issues arise
- User uploads use `unoptimized={true}` to prevent crashes

## Troubleshooting

### Build Fails
- Check Node version matches Cloudflare Pages environment
- Verify all environment variables are set
- Check build logs in Cloudflare Dashboard

### Domain Not Resolving
- Verify DNS records are correct
- Check DNS propagation (can take up to 48 hours, usually < 1 hour)
- Ensure SSL certificate is issued

### Authentication Issues
- Verify Supabase environment variables are correct
- Check that `NEXT_PUBLIC_SITE_URL` matches production domain
- Verify RLS policies are active in Supabase

### Caching Issues
- Clear Cloudflare cache: Dashboard → Caching → Purge Everything
- Verify cache rules are correctly configured
- Check that `Cache-Control` headers are being respected

## Quick Reference Commands

```bash
# Local build test
npm run build
npm start

# Deploy via Wrangler (if using CLI)
npx wrangler pages deploy .next --project-name=your-project-name

# Check environment variables
# (View in Cloudflare Dashboard → Pages → Settings → Environment Variables)
```

---

**Last Updated**: Based on `Deployment_Handover.md` and project structure
**Domain**: nfebeuty.com
**Framework**: Next.js 14 App Router

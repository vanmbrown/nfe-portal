# Promote Changes to Production - nfebeuty.com

## Quick Steps to Deploy Changes

### 1. Commit & Push Your Changes
```bash
# Make sure all changes are committed
git add .
git commit -m "Your commit message"
git push origin main  # or your production branch
```

### 2. Trigger Deployment in Cloudflare

#### Option A: Automatic (if Git integration is enabled)
- [ ] Push to your production branch (usually `main`)
- [ ] Cloudflare will automatically detect the push and start building
- [ ] Monitor deployment in Cloudflare Dashboard → Pages → Your Project → Deployments

#### Option B: Manual Trigger
- [ ] Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Navigate to: **Pages** → **Your Project** (nfebeuty.com)
- [ ] Click **"Retry deployment"** on the latest deployment, OR
- [ ] Click **"Create deployment"** → Select branch → **"Save and Deploy"**

### 3. Monitor Deployment
- [ ] Watch build logs in Cloudflare Dashboard
- [ ] Verify build completes successfully (green checkmark)
- [ ] Check for any build errors or warnings

### 4. Quick Verification (Post-Deploy)
- [ ] Visit `https://nfebeuty.com` - verify changes are live
- [ ] Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to bypass cache
- [ ] Test any changed functionality
- [ ] Check browser console for errors

### 5. Clear Cache (if needed)
If changes aren't showing up:
- [ ] Cloudflare Dashboard → **Caching** → **Configuration**
- [ ] Click **"Purge Everything"** to clear cache
- [ ] Or use **"Custom Purge"** to clear specific URLs

## Common Issues

### Changes Not Showing
- **Cache**: Clear Cloudflare cache (see step 5)
- **Browser cache**: Hard refresh or clear browser cache
- **Build failed**: Check build logs in Cloudflare Dashboard

### Build Fails
- Check build logs for specific errors
- Verify environment variables are still set correctly
- Ensure Node version is compatible
- Check for any new dependencies that need to be installed

### Deployment Stuck
- Cancel and retry the deployment
- Check Cloudflare status page for service issues
- Verify Git repository is accessible

## Quick Reference

**Cloudflare Dashboard**: https://dash.cloudflare.com  
**Pages Projects**: https://dash.cloudflare.com → Pages  
**Deployment Logs**: Pages → Your Project → Click on deployment → View logs

---

**Note**: If you're using preview deployments, make sure you're promoting the correct deployment to production.

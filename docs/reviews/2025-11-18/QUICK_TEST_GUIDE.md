# Quick Testing Guide - Critical Fixes
**For:** NFE Portal Manual Testing  
**Date:** November 18, 2025

---

## 🚀 Quick Start

1. ✅ Dev server running on `http://localhost:3000`
2. ✅ All fixes implemented
3. ⏳ Ready for manual testing

---

## 🔴 CRITICAL TESTS (Do These First)

### Test 1: Admin Security (5 minutes)
**WHY:** Prevents unauthorized access to sensitive data

1. Open Incognito/Private browser window
2. Open DevTools (F12) → Network tab
3. Navigate to: `http://localhost:3000/focus-group/admin`
4. **VERIFY:** Redirects to `/focus-group/login`
5. **CRITICAL:** Check Network tab - NO participant data should be visible
   - ❌ FAIL = Security breach, stop testing
   - ✅ PASS = Continue

### Test 2: EXIF Privacy (10 minutes)
**WHY:** Prevents participant location tracking

1. Take photo with smartphone (ensures GPS metadata)
2. Log in as focus group participant
3. Upload photo via focus group upload form
4. Download uploaded image from Supabase Storage
5. Check EXIF at: https://www.verexif.com
6. **VERIFY:** No GPS coordinates visible
   - ❌ FAIL = Privacy violation, stop testing
   - ✅ PASS = Continue

### Test 3: Email Notifications (2 minutes)
**WHY:** Ensures Resend API key working

1. Navigate to: `http://localhost:3000/subscribe`
2. Submit test email: `test@example.com`
3. Check vanessa@nfebeauty.com inbox
4. **VERIFY:** Email received with subject "New Newsletter Subscriber"
   - ❌ FAIL = Resend API issue, check `.env.local`
   - ✅ PASS = Continue

---

## 🟡 HIGH PRIORITY TESTS

### Test 4: Redirect Paths (2 minutes)
1. Log out
2. Navigate to: `http://localhost:3000/focus-group/feedback`
3. **VERIFY:** Redirects to `/focus-group/login` (NOT 404)

### Test 5: Database Tables (5 minutes)
1. Submit feedback as participant
2. Open Supabase → Tables → `focus_group_feedback`
3. **VERIFY:** New row appears with correct `profile_id`
4. Upload test image
5. Check `focus_group_uploads` table
6. **VERIFY:** New row appears

### Test 6: Rate Limiting (3 minutes)
1. Navigate to: `http://localhost:3000/subscribe`
2. Submit email 4 times rapidly
3. **VERIFY:** 4th request shows error "Too many requests"
4. Check browser DevTools Console for any errors

---

## 🟢 STANDARD TESTS

### Test 7: Image Display (1 minute)
1. Navigate to: `http://localhost:3000/products`
2. **VERIFY:** Both Face Elixir and Body Elixir images display
3. Navigate to: `http://localhost:3000/shop`
4. **VERIFY:** Both product images display
5. Open DevTools Console
6. **VERIFY:** No 404 errors

### Test 8: Waitlist Modal (2 minutes)
1. Navigate to: `http://localhost:3000/products/face-elixir`
2. Click "Join Waitlist" button
3. **VERIFY:** Modal opens
4. Enter test email, submit
5. **VERIFY:** Success message, modal closes
6. Check Supabase `waitlist` table
7. **VERIFY:** New row appears

---

## 📋 Quick Checklist

Copy this to track your testing:

```
CRITICAL TESTS
[ ] Admin security - no data leak in Network tab
[ ] EXIF stripping - GPS removed from uploads
[ ] Email notifications - Resend working

HIGH PRIORITY
[ ] Redirects go to /focus-group/login (not 404)
[ ] Feedback saves to focus_group_feedback table
[ ] Uploads save to focus_group_uploads table
[ ] Rate limiting blocks 4th request

STANDARD TESTS
[ ] Product images display on /products
[ ] Product images display on /shop
[ ] Waitlist modal opens and works
[ ] No console errors on homepage
```

---

## 🚨 Stop Testing If...

1. **Admin data visible in Network tab** → Security breach
2. **EXIF not stripped** → Privacy violation
3. **Multiple 404 errors** → Deployment issue

Contact development team immediately if any of above occur.

---

## ✅ All Tests Pass?

If all tests pass, system is ready for production deployment.

Next steps:
1. Update production environment variables
2. Deploy to staging
3. Repeat critical tests in staging
4. Deploy to production

---

## 🔧 Quick Troubleshooting

### Email not sending
- Check `.env.local` has `RESEND_API_KEY`
- Restart dev server: `npm run dev`

### Rate limiting not working
- Check `.env.local` has Upstash credentials
- Expected behavior: Works if configured, skipped if not

### Images not loading
- Check file exists: `public/images/products/body-elixir-detail.jpg`
- Clear browser cache

### Admin page loads for non-admin
- **CRITICAL:** Stop testing
- Check `src/app/focus-group/admin/layout.tsx` exists
- Restart dev server

---

## 📞 Support

For issues during testing:
- Check full test report: `CRITICAL_FIXES_TEST_REPORT.md`
- Review code review: `FINAL_SUMMARY_AND_RECOMMENDATIONS.md`
- Environment variables: `.env.local`



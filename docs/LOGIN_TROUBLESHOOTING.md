# Login Error Troubleshooting Guide

## Common Login Errors and Solutions

### Error 1: "Invalid supabaseUrl" or "Missing Supabase environment variables"

**Cause**: Your `.env.local` file has placeholder values instead of real Supabase credentials.

**Solution**:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your credentials from Settings → API
3. Update `.env.local` with actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
4. Restart your dev server

---

### Error 2: "Invalid login credentials" or "Email not confirmed"

**Cause**: 
- Wrong email/password
- Email confirmation required but not completed
- Account doesn't exist

**Solutions**:

**Option A: Register a new account**
1. Click "Don't have an account? Sign up"
2. Create a new account
3. Check your email for confirmation (if enabled)

**Option B: Disable email confirmation (for development)**
1. In Supabase dashboard: **Authentication** → **Settings**
2. Under "Email Auth", toggle off "Enable email confirmations"
3. Try logging in again

**Option C: Reset password**
1. In Supabase dashboard: **Authentication** → **Users**
2. Find your user
3. Click "Reset password" or use password reset flow

---

### Error 3: "relation 'profiles' does not exist" or Database errors

**Cause**: Database schema hasn't been set up yet.

**Solution**:
1. In Supabase dashboard: **SQL Editor**
2. Open `supabase/schema.sql` from your project
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run"
6. Verify tables exist: Go to **Table Editor** → should see `profiles`, `feedback`, `images`

---

### Error 4: "new row violates row-level security policy"

**Cause**: RLS (Row Level Security) policies are blocking the query.

**Solution**:
1. Ensure you executed `supabase/schema.sql` completely (includes RLS policies)
2. Check RLS is enabled: **Table Editor** → `profiles` → **Policies** tab
3. Verify policies exist and are enabled (green toggle)
4. For testing, you can temporarily disable RLS:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
   (Re-enable after testing!)

---

### Error 5: "Failed to fetch" or Network errors

**Cause**: 
- Supabase URL is incorrect
- CORS issues
- Network connectivity

**Solutions**:
1. Verify your Supabase URL in `.env.local` is correct
2. Check Supabase project is active (not paused)
3. Try accessing Supabase dashboard to confirm project is running
4. Check browser console for detailed error messages

---

### Error 6: Page loads but login form doesn't appear

**Cause**: Session check is failing or redirecting.

**Solution**:
1. Check browser console for errors
2. Verify Supabase client is initializing correctly
3. Try clearing browser cache and cookies
4. Check that `.env.local` values are correct

---

### Error 7: "Cannot read property 'user' of undefined"

**Cause**: Supabase auth response is malformed.

**Solution**:
1. Check Supabase project is active
2. Verify API keys are correct
3. Check browser console for detailed error
4. Ensure you're using the correct Supabase project (not a deleted/paused one)

---

## Quick Diagnostic Steps

### Step 1: Verify Environment Variables
```bash
npm run verify-supabase
```

### Step 2: Check Supabase Connection
1. Open browser console (F12)
2. Go to `/focus-group/login`
3. Look for any red errors
4. Check Network tab for failed requests

### Step 3: Verify Database Setup
1. In Supabase: **Table Editor**
2. Confirm these tables exist:
   - ✅ `profiles`
   - ✅ `feedback`
   - ✅ `images`

### Step 4: Test Supabase Auth Directly
1. In Supabase: **Authentication** → **Users**
2. Try creating a test user manually
3. Then try logging in with those credentials

---

## Still Having Issues?

### Check These:

1. **Is your Supabase project active?**
   - Go to supabase.com dashboard
   - Project should show "Active" status

2. **Are your API keys correct?**
   - Settings → API
   - Copy keys again and update `.env.local`
   - Restart dev server

3. **Is the database schema set up?**
   - SQL Editor → Run `supabase/schema.sql`
   - Verify tables exist in Table Editor

4. **Is email confirmation disabled?** (for development)
   - Authentication → Settings
   - Toggle off "Enable email confirmations"

5. **Check browser console**
   - Press F12
   - Look at Console and Network tabs
   - Share specific error messages for help

---

## Need More Help?

Share the specific error message you're seeing, and I can provide targeted assistance!









# Supabase Setup - Step-by-Step Guide

Follow these steps to set up Supabase for the NFE Focus Group Portal.

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Sign in with GitHub (recommended) or email
4. Click "New Project"
5. Fill in project details:
   - **Name**: `nfe-focus-group` (or your preferred name)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

## Step 3: Set Up Environment Variables

1. In your project root, create `.env.local` file:
   ```bash
   # Windows
   copy .env.example .env.local
   
   # Mac/Linux
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ADMIN_EMAILS=vanessa@nfebeauty.com
   ```

3. **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open `supabase/schema.sql` from your project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see "Success. No rows returned"
8. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `profiles`, `feedback`, `images`

## Step 5: Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Configure:
   - **Name**: `images`
   - **Public bucket**: Your choice (Public = easier, Private = more secure)
   - Click "Create bucket"
4. Go back to **SQL Editor**
5. Open `supabase/storage_policies.sql` from your project
6. Copy the entire contents
7. Paste into SQL Editor
8. Click "Run"
9. You should see "Success. No rows returned"

## Step 6: Configure Admin Email (Optional but Recommended)

1. In Supabase dashboard, go to **SQL Editor**
2. Run this query (replace with your admin email):
   ```sql
   ALTER SYSTEM SET app.admin_emails = 'vanessa@nfebeauty.com';
   SELECT pg_reload_conf();
   ```
3. This allows the admin email to access all data via RLS policies

## Step 7: Verify Setup

Run the verification script:
```bash
npm run verify-supabase
```

Or manually test:
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/focus-group/login`
3. Try registering a test account
4. Complete the profile form
5. Check Supabase dashboard → **Table Editor** → `profiles` to see your data

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists in project root
- Check that all variables are filled in
- Restart dev server after adding variables

### "Failed to create account"
- Check Supabase Auth is enabled (should be by default)
- Verify email confirmation settings in **Authentication** → **Settings**
- For development, you may want to disable email confirmation temporarily

### "RLS policy violation"
- Ensure you executed `supabase/schema.sql` completely
- Check **Table Editor** → **profiles** → **Policies** to see RLS policies
- Verify policies are enabled (green toggle)

### "Storage upload failed"
- Ensure `images` bucket exists
- Check bucket is public OR you're using signed URLs
- Verify storage policies were executed

## Next Steps

Once setup is complete:
1. Test user registration
2. Test profile creation
3. Proceed to Phase 2: Image uploads and feedback forms









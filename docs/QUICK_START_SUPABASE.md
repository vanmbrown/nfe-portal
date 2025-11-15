# Quick Start: Supabase Setup

## The Error You're Seeing

If you see: **"Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"**

This means your `.env.local` file still has placeholder values. You need to replace them with your actual Supabase credentials.

## 5-Minute Setup

### Step 1: Create Supabase Project (2 minutes)

1. Go to **[supabase.com](https://supabase.com)** and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `nfe-focus-group` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2: Get Your Credentials (1 minute)

1. In your Supabase project, go to **Settings** → **API**
2. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (long string, keep this secret!)

### Step 3: Update .env.local (1 minute)

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
# Replace "your_supabase_project_url" with your actual URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Replace "your_supabase_anon_key" with your actual anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replace "your_supabase_service_role_key" with your actual service role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Keep this as is
ADMIN_EMAILS=vanessa@nfebeauty.com
```

### Step 4: Set Up Database (1 minute)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase/schema.sql` from your project folder
4. Copy the entire file contents
5. Paste into SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

### Step 5: Set Up Storage (1 minute)

1. In Supabase dashboard, go to **Storage**
2. Click **"New bucket"**
3. Name: `images`
4. Choose **Public** or **Private** (your choice)
5. Click **"Create bucket"**
6. Go back to **SQL Editor**
7. Open `supabase/storage_policies.sql` from your project
8. Copy and paste into SQL Editor
9. Click **"Run"**

### Step 6: Restart Dev Server

1. Stop your dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```
3. Visit: `http://localhost:3000/focus-group/login`

## Verify Setup

Run this command to check your setup:
```bash
npm run verify-supabase
```

## Still Having Issues?

### Error: "Invalid supabaseUrl"
- Make sure you replaced ALL placeholder values in `.env.local`
- Check that your URL starts with `https://`
- Restart your dev server after updating `.env.local`

### Error: "Missing Supabase environment variables"
- Ensure `.env.local` exists in your project root
- Check that variable names match exactly (case-sensitive)
- No spaces around the `=` sign

### Can't find Supabase credentials?
- Go to your Supabase project dashboard
- Click **Settings** (gear icon) → **API**
- All keys are listed there

## Need Help?

See the detailed guide: `scripts/setup-supabase.md`









# NFE Focus Group Portal - Setup Guide

## Phase 1: Authentication + Profile Setup - Complete ✅

This guide will help you set up the Focus Group Portal with Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Git installed

## Step 1: Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned (takes 2-3 minutes)
3. Note your project URL and API keys from Settings → API

## Step 2: Database Schema Setup

1. In your Supabase project, go to SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste and execute in the SQL Editor
4. Verify tables were created: `profiles`, `feedback`, `images`

## Step 3: Storage Bucket Setup

1. Go to Storage in your Supabase dashboard
2. Click "New Bucket"
3. Name it: `images`
4. Choose Public or Private (your preference)
5. Go back to SQL Editor
6. Copy contents of `supabase/storage_policies.sql`
7. Paste and execute

## Step 4: Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_EMAILS=vanessa@nfebeauty.com
   ```

⚠️ **Important**: Never commit `.env.local` to git. The service role key is sensitive.

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## Step 7: Test Authentication

1. Navigate to `/focus-group/login`
2. Create a test account
3. Complete the profile form
4. Verify you're redirected to `/focus-group/feedback`

## Current Features (Phase 1)

✅ User registration and login  
✅ Profile creation with:
   - Age range
   - Fitzpatrick skin tone (1-6)
   - Top skin concerns (multi-select)
   - Lifestyle factors (optional)
   - Image consent (required)
   - Marketing consent (optional)  
✅ Protected routes (requires authentication)  
✅ Session management  
✅ Data isolation via Row Level Security (RLS)

## Next Steps (Phase 2)

- Image upload functionality
- Weekly feedback form
- Progress log

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists and has all required variables
- Restart the dev server after adding environment variables

### "Failed to sign in"
- Check that Supabase Auth is enabled in your project
- Verify email confirmation settings in Supabase dashboard

### "RLS policy violation"
- Ensure you've executed `supabase/schema.sql` completely
- Check that RLS is enabled on all tables

### Profile not saving
- Check browser console for errors
- Verify user is authenticated (check Supabase Auth dashboard)
- Ensure profile table exists and RLS policies are correct

## Database Schema Reference

### Tables

- **profiles**: User demographic and consent data
- **feedback**: Weekly feedback entries (Phase 2)
- **images**: Uploaded image metadata (Phase 2)

### Row Level Security

- Users can only read/write their own data
- Admins (via ADMIN_EMAILS) can read all data
- All policies are enforced at the database level

## Support

For issues or questions, contact the development team.









# Focus Group Portal - Setup Complete Summary

## ✅ Completed Steps

### 1. Type System Updates
All code has been updated to use the generated Supabase types:

- ✅ `src/app/focus-group/admin/page.tsx` - Uses generated types
- ✅ `src/app/focus-group/admin/components/FeedbackTable.tsx` - Uses generated types
- ✅ `src/app/focus-group/admin/participant/[userId]/page.tsx` - Uses generated types
- ✅ `src/app/focus-group/upload/hooks/useUploads.ts` - Extends generated types
- ✅ `src/app/focus-group/feedback/hooks/useFeedback.ts` - Extends generated types

### 2. Verification Script
Created `scripts/verify-migrations.js` to check if all migrations are executed.

**Usage:**
```bash
npm run verify-migrations
```

This script checks for:
- Status and current_week columns in profiles table
- focus_group_feedback table
- focus_group_uploads table
- focus_group_messages table

## 📋 Remaining Manual Steps

### 1. Execute Database Migrations

Run these 3 migration files in Supabase SQL Editor (in order):

1. **`supabase/migration_focus_group_status_week.sql`**
   - Adds `status` and `current_week` columns to profiles
   - Creates indexes

2. **`supabase/migration_focus_group_tables.sql`**
   - Creates `focus_group_feedback` table
   - Creates `focus_group_uploads` table
   - Sets up RLS policies

3. **`supabase/migration_focus_group_messages.sql`**
   - Creates `focus_group_messages` table
   - Sets up RLS policies

**How to Execute:**
1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy entire migration file contents
4. Paste and click "Run"
5. Verify: "Success. No rows returned"
6. Repeat for each migration

### 2. Verify Migrations

After executing migrations, run:
```bash
npm run verify-migrations
```

This will confirm all tables and columns exist.

### 3. Set Up Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `focus-group-uploads`
3. Set it to **Private**
4. Verify RLS policies are set (should be in `supabase/storage_policies.sql`)

### 4. Create Admin User

Set at least one user as admin:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then set as admin (replace YOUR_USER_ID with actual ID)
UPDATE profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_ID';
```

### 5. Test the System

#### Participant Flow:
1. Register at `/focus-group/login`
2. Complete profile at `/focus-group/profile`
3. Submit feedback at `/focus-group/feedback`
4. Upload images at `/focus-group/upload`
5. Send/receive messages at `/focus-group/messages`

#### Admin Flow:
1. Log in as admin user
2. Access dashboard at `/focus-group/admin`
3. View participants, feedback, uploads
4. Send messages to participants
5. View participant detail pages

## 🎯 Quick Start Checklist

- [ ] Execute `migration_focus_group_status_week.sql`
- [ ] Execute `migration_focus_group_tables.sql`
- [ ] Execute `migration_focus_group_messages.sql`
- [ ] Run `npm run verify-migrations` to confirm
- [ ] Create storage bucket `focus-group-uploads`
- [ ] Set at least one user as admin
- [ ] Test participant registration and profile
- [ ] Test feedback submission
- [ ] Test image uploads
- [ ] Test messaging system
- [ ] Test admin dashboard

## 📁 Files Modified

### Type Updates:
- `src/app/focus-group/admin/page.tsx`
- `src/app/focus-group/admin/components/FeedbackTable.tsx`
- `src/app/focus-group/admin/participant/[userId]/page.tsx`
- `src/app/focus-group/upload/hooks/useUploads.ts`
- `src/app/focus-group/feedback/hooks/useFeedback.ts`

### New Files:
- `scripts/verify-migrations.js` - Migration verification script
- `docs/FOCUS_GROUP_SETUP_COMPLETE.md` - This file

## 🚀 Next Steps After Migrations

Once migrations are executed:

1. **Test Participant Flow:**
   - Register → Profile → Feedback → Uploads → Messages

2. **Test Admin Flow:**
   - Dashboard → Participants → Messages → Feedback → Uploads

3. **Verify Features:**
   - Profile auto-save works
   - Feedback can be submitted and edited
   - Images can be uploaded and viewed
   - Messages can be sent between admin and participants
   - Notifications show unread counts
   - Admin dashboard displays all data correctly

## 🐛 Troubleshooting

### "Table does not exist" errors
- Run the migration files in Supabase SQL Editor
- Verify with `npm run verify-migrations`

### "Permission denied" errors
- Check RLS policies are set up correctly
- Verify user is authenticated
- For admin access, ensure `is_admin = true` in profiles table

### Type errors in TypeScript
- Ensure `src/types/supabase.ts` was regenerated after migrations
- Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts`

### Storage errors
- Verify bucket `focus-group-uploads` exists
- Check bucket is set to Private
- Verify RLS policies for storage

---

**Status**: Code implementation complete ✅  
**Next**: Execute migrations and test the system









# RLS Policy Troubleshooting Guide

If RLS tests are failing, follow these steps to diagnose and fix the issues.

## Common Issues

### Issue 1: Users Can See Other Users' Data

**Symptoms:**
- Test shows "User1 can see more than their own profile"
- Users can query and see data from other users

**Causes:**
1. RLS is not enabled on the table
2. Policies are not correctly defined
3. Policies were dropped or never created

**Solution:**
1. Run the fix script in Supabase SQL Editor:
   ```sql
   -- Copy and paste contents of scripts/fix-rls-policies.sql
   ```

2. Verify RLS is enabled:
   ```sql
   SELECT tablename, relrowsecurity 
   FROM pg_tables t
   JOIN pg_class c ON c.relname = t.tablename
   WHERE schemaname = 'public' 
     AND tablename IN ('profiles', 'feedback', 'images');
   ```
   All should show `relrowsecurity = true`

3. Verify policies exist:
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('profiles', 'feedback', 'images')
   ORDER BY tablename, policyname;
   ```

### Issue 2: Cannot Create Test Data

**Symptoms:**
- "Failed to create test feedback"
- "Failed to create test images"
- Admin client cannot insert data

**Causes:**
1. Unique constraint violations (data already exists)
2. Missing required fields
3. Foreign key constraint violations
4. RLS blocking even service role (shouldn't happen, but check)

**Solution:**
1. Clean up existing test data:
   ```sql
   -- Delete test user data (run as admin/service role)
   DELETE FROM feedback WHERE user_id IN (
     SELECT id FROM auth.users WHERE email LIKE 'testuser%@example.com'
   );
   DELETE FROM images WHERE user_id IN (
     SELECT id FROM auth.users WHERE email LIKE 'testuser%@example.com'
   );
   DELETE FROM profiles WHERE user_id IN (
     SELECT id FROM auth.users WHERE email LIKE 'testuser%@example.com'
   );
   ```

2. Check for existing profiles:
   ```sql
   SELECT COUNT(*) FROM profiles;
   SELECT user_id, COUNT(*) 
   FROM profiles 
   GROUP BY user_id 
   HAVING COUNT(*) > 1;
   ```

3. Verify service role key is correct:
   - Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
   - Service role should bypass RLS

### Issue 3: Policies Not Working After Update

**Symptoms:**
- Policies exist but don't work
- Users can still see other users' data

**Causes:**
1. Policies use wrong syntax
2. `auth.uid()` is not returning correct value
3. Policies need to be recreated

**Solution:**
1. Drop and recreate policies:
   ```sql
   -- Use scripts/fix-rls-policies.sql
   ```

2. Test `auth.uid()` function:
   ```sql
   -- As a logged-in user, run:
   SELECT auth.uid() as current_user_id;
   ```

3. Verify policy syntax:
   ```sql
   -- Check policy definitions
   SELECT 
     tablename,
     policyname,
     cmd,
     qual as using_clause,
     with_check
   FROM pg_policies
   WHERE tablename = 'profiles';
   ```

## Diagnostic Commands

### Check RLS Status
```bash
npm run diagnose:rls
```

### Run Tests
```bash
npm run test:rls
```

### Manual SQL Checks

1. **Check RLS enabled:**
   ```sql
   SELECT 
     c.relname as table_name,
     c.relrowsecurity as rls_enabled
   FROM pg_class c
   JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relkind = 'r'
     AND c.relname IN ('profiles', 'feedback', 'images');
   ```

2. **Check policies:**
   ```sql
   SELECT 
     schemaname,
     tablename,
     policyname,
     permissive,
     roles,
     cmd,
     qual,
     with_check
   FROM pg_policies
   WHERE tablename IN ('profiles', 'feedback', 'images')
   ORDER BY tablename, policyname;
   ```

3. **Test as specific user:**
   ```sql
   -- First, get user ID
   SELECT id, email FROM auth.users WHERE email = 'testuser1@example.com';
   
   -- Then test query (this requires setting the auth context)
   -- Use Supabase Dashboard → SQL Editor → Run as user
   SELECT * FROM profiles;
   -- Should only return that user's profile
   ```

## Quick Fix Script

If all else fails, run this complete reset:

```sql
-- 1. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 2. Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can insert own images" ON images;
DROP POLICY IF EXISTS "Users can delete own images" ON images;

-- 3. Recreate policies (copy from scripts/fix-rls-policies.sql)
-- ... (see that file for complete policy definitions)
```

## Verification Checklist

After fixing, verify:

- [ ] RLS is enabled on all three tables
- [ ] Policies exist for SELECT, INSERT, UPDATE (and DELETE for images)
- [ ] Policies use `auth.uid() = user_id`
- [ ] Test users can only see their own data
- [ ] Test users cannot insert data for other users
- [ ] Service role can still access all data (for admin operations)

## Still Having Issues?

1. Check Supabase Dashboard → Authentication → Policies
2. Review Supabase logs for policy evaluation errors
3. Verify `auth.uid()` returns correct UUID
4. Check for conflicting policies
5. Ensure no policies allow `SELECT *` without user_id filter





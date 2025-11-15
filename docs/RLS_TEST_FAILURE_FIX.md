# RLS Test Failure Fix Guide

## Current Test Failures

After running the SQL schema script, the RLS tests are still failing:

1. **Profile Isolation**: Service role cannot insert profiles (RLS blocking)
2. **Feedback Isolation**: `hydration_rating` column not found
3. **Image Isolation**: Service role cannot insert images (RLS blocking)
4. **Cannot Insert for Other**: ✅ PASSING (this is correct)

## Issue 1: Service Role Not Bypassing RLS

**Problem**: The service role key should automatically bypass RLS, but it's being blocked.

**Possible Causes**:
1. Wrong key being used (anon key instead of service role key)
2. Service role doesn't have BYPASSRLS permission
3. Client configuration issue

**Solutions**:

### Solution A: Verify Service Role Key

1. Go to Supabase Dashboard → Settings → API
2. Copy the **Service Role Key** (starts with `eyJ...`, very long)
3. Verify it's in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
4. Make sure you're NOT using the anon key

### Solution B: Use Helper Functions

If service role key still doesn't work, use the helper functions created by `scripts/fix-service-role-rls.sql`:

```javascript
// In test script, use RPC instead of direct insert
const { data, error } = await adminClient.rpc('admin_insert_profile', {
  p_user_id: user1Id,
  p_age_range: '26-35',
  p_top_concerns: ['acne']
});
```

### Solution C: Check Service Role Permissions

Run in Supabase SQL Editor:
```sql
SELECT rolname, rolsuper, rolbypassrls
FROM pg_roles
WHERE rolname = 'service_role';
```

Should show `rolbypassrls = true`. If not:
```sql
ALTER ROLE service_role BYPASSRLS;
```

## Issue 2: Feedback Table Schema Mismatch

**Problem**: `hydration_rating` column doesn't exist in feedback table.

**Solution**:

1. **Check current schema**:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'feedback';
   ```

2. **If columns are missing, add them**:
   ```sql
   ALTER TABLE feedback 
   ADD COLUMN IF NOT EXISTS hydration_rating INTEGER NOT NULL 
     CHECK (hydration_rating BETWEEN 1 AND 5) DEFAULT 3;
   
   ALTER TABLE feedback 
   ADD COLUMN IF NOT EXISTS tone_rating INTEGER NOT NULL 
     CHECK (tone_rating BETWEEN 1 AND 5) DEFAULT 3;
   
   ALTER TABLE feedback 
   ADD COLUMN IF NOT EXISTS texture_rating INTEGER NOT NULL 
     CHECK (texture_rating BETWEEN 1 AND 5) DEFAULT 3;
   
   ALTER TABLE feedback 
   ADD COLUMN IF NOT EXISTS overall_rating INTEGER NOT NULL 
     CHECK (overall_rating BETWEEN 1 AND 5) DEFAULT 3;
   ```

3. **Or recreate the table** (if safe to do so):
   - Run `supabase/schema.sql` which should create it correctly

## Quick Fix Steps

1. **Verify service role key**:
   ```bash
   # Check .env.local
   grep SUPABASE_SERVICE_ROLE_KEY .env.local
   ```

2. **Run schema verification**:
   ```sql
   -- In Supabase SQL Editor
   -- Run scripts/verify-feedback-schema.sql
   ```

3. **Run service role fix**:
   ```sql
   -- In Supabase SQL Editor
   -- Run scripts/fix-service-role-rls.sql
   ```

4. **Re-run tests**:
   ```bash
   npm run test:rls
   ```

## Expected Behavior

After fixes:
- ✅ Service role should bypass RLS (or use helper functions)
- ✅ Feedback table should have all required columns
- ✅ All tests should pass

## If Still Failing

1. Check Supabase logs for detailed error messages
2. Verify RLS policies are correctly defined
3. Test service role key manually in Supabase SQL Editor
4. Consider using the helper functions approach if service role continues to fail





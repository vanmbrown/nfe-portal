# RLS Admin Client Issue Fix

## Problem

The test script is using the service role key (admin client) to create test data, but it's getting RLS policy violations:
- Error: "new row violates row-level security policy for table 'profiles'"
- Error: "new row violates row-level security policy for table 'images'"

## Root Cause

The service role key **should** bypass RLS automatically, but there are a few possible issues:

1. **Service role key not configured correctly** - The key might not be the actual service role key
2. **RLS policies too restrictive** - Even service role might be blocked if policies are misconfigured
3. **Client configuration** - The Supabase client might need explicit configuration

## Solution

### Option 1: Verify Service Role Key

1. Go to Supabase Dashboard → Settings → API
2. Copy the **Service Role Key** (not the anon key)
3. Ensure it's set in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### Option 2: Use RPC Function to Bypass RLS

If the service role key still doesn't work, create a function that bypasses RLS:

```sql
-- Create a function that can insert test data (bypasses RLS)
CREATE OR REPLACE FUNCTION create_test_profile(
  p_user_id UUID,
  p_age_range TEXT,
  p_top_concerns TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  INSERT INTO profiles (user_id, age_range, top_concerns)
  VALUES (p_user_id, p_age_range, p_top_concerns)
  RETURNING id INTO v_profile_id;
  RETURN v_profile_id;
END;
$$;
```

### Option 3: Temporarily Disable RLS for Testing

**⚠️ WARNING: Only for testing, never in production!**

```sql
-- Temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- Run tests...

-- Re-enable RLS after testing
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
```

### Option 4: Fix Test Script (Recommended)

The test script has been updated to:
1. Delete existing test data before inserting (avoids conflicts)
2. Use `INSERT` instead of `UPSERT` (clearer error messages)
3. Handle unique constraint violations
4. Check for schema issues before attempting inserts

## Verification

After applying the fix, verify:

1. Service role key is correct:
   ```bash
   # Check .env.local
   grep SUPABASE_SERVICE_ROLE_KEY .env.local
   ```

2. Test admin client can bypass RLS:
   ```sql
   -- In Supabase SQL Editor, run as service role
   -- This should work without RLS blocking
   INSERT INTO profiles (user_id, age_range)
   VALUES ('00000000-0000-0000-0000-000000000000', '26-35');
   ```

3. Re-run tests:
   ```bash
   npm run test:rls
   ```

## Expected Behavior

- **Service Role Key**: Should bypass ALL RLS policies automatically
- **Anon Key**: Should be subject to RLS policies
- **Test Script**: Should be able to create test data using service role

If service role key still doesn't bypass RLS, there's likely a configuration issue with the Supabase project.





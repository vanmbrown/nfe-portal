# RLS Tests - Final Fix Steps

## Current Status

Tests are failing due to:
1. **Service role key not bypassing RLS** (profiles & images)
2. **Feedback table missing columns** (`notes`, `hydration_rating`, etc.)

## Quick Fix (3 Steps)

### Step 1: Fix Feedback Table Schema

Run `scripts/fix-feedback-table-schema.sql` in Supabase SQL Editor:
- This will add all missing columns to the feedback table
- Safe to run multiple times (uses `IF NOT EXISTS`)

### Step 2: Create Helper Functions (Bypass RLS)

Run `scripts/fix-service-role-rls.sql` in Supabase SQL Editor:
- Creates `admin_insert_profile()` function
- Creates `admin_insert_feedback()` function  
- Creates `admin_insert_image()` function
- These functions use `SECURITY DEFINER` to bypass RLS

### Step 3: Re-run Tests

```bash
npm run test:rls
```

The test script has been updated to:
- Try using RPC functions first (bypass RLS)
- Fallback to direct inserts if functions don't exist
- Should now pass all tests

## Expected Results

After running both SQL scripts:
- ✅ Profile Isolation: PASS
- ✅ Feedback Isolation: PASS
- ✅ Image Isolation: PASS
- ✅ Cannot Insert for Other: PASS (already working)

## If Tests Still Fail

1. **Check helper functions exist**:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE 'admin_%';
   ```

2. **Verify feedback table columns**:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'feedback';
   ```

3. **Check service role key**:
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` is the actual service role key
   - Get it from: Supabase Dashboard → Settings → API → Service Role Key

## Alternative: Manual Test Data Creation

If helper functions don't work, you can manually create test data in Supabase SQL Editor:

```sql
-- As service role, these should work
INSERT INTO profiles (user_id, age_range, top_concerns)
VALUES 
  ('user1-uuid-here', '26-35', ARRAY['acne']),
  ('user2-uuid-here', '36-45', ARRAY['wrinkles']);

INSERT INTO feedback (user_id, week_number, hydration_rating, tone_rating, texture_rating, overall_rating, notes)
VALUES 
  ('user1-uuid-here', 1, 4, 4, 4, 4, 'User1 feedback'),
  ('user2-uuid-here', 1, 5, 5, 5, 5, 'User2 feedback');
```

Then run the tests - they should pass for the isolation checks.





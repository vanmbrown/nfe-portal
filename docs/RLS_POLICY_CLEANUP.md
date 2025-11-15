# RLS Policy Cleanup Guide

## Issue Identified

The diagnostic revealed **duplicate RLS policies** on the `profiles` table:
- **9 policies** exist when there should only be **3**
- Multiple policies with different names doing the same thing
- This can cause conflicts and unexpected behavior

## Current State

### Profiles Table (9 policies - TOO MANY)
- ✅ "Users can view own profile" (SELECT) - **KEEP**
- ✅ "Users can insert own profile" (INSERT) - **KEEP**
- ✅ "Users can update own profile" (UPDATE) - **KEEP**
- ❌ "Enable profile insert for authenticated users" (INSERT) - **REMOVE**
- ❌ "Enable profile update for user" (UPDATE) - **REMOVE**
- ❌ "profile_owner_can_insert" (INSERT) - **REMOVE**
- ❌ "profile_owner_can_select" (SELECT) - **REMOVE**
- ❌ "profile_owner_can_update" (UPDATE) - **REMOVE**
- ❌ "profiles_ins" (INSERT) - **REMOVE**
- ❌ "profiles_sel" (SELECT) - **REMOVE**
- ❌ "profiles_upd" (UPDATE) - **REMOVE**

### Feedback Table (4 policies - 1 duplicate)
- ✅ "Users can view own feedback" (SELECT) - **KEEP**
- ✅ "Users can insert own feedback" (INSERT) - **KEEP**
- ✅ "Users can update own feedback" (UPDATE) - **KEEP**
- ❌ "feedback_owner" (ALL) - **REMOVE** (redundant)

### Images Table (3 policies - CORRECT)
- ✅ "Users can view own images" (SELECT) - **KEEP**
- ✅ "Users can insert own images" (INSERT) - **KEEP**
- ✅ "Users can delete own images" (DELETE) - **KEEP**

## Solution

### Step 1: Clean Up Duplicate Policies

Run `scripts/cleanup-duplicate-policies.sql` in Supabase SQL Editor:

```sql
-- This will remove all duplicate policies
-- Keeping only the properly named ones
```

### Step 2: Verify Cleanup

After cleanup, verify you have exactly:
- **profiles**: 3 policies (SELECT, INSERT, UPDATE)
- **feedback**: 3 policies (SELECT, INSERT, UPDATE)
- **images**: 3 policies (SELECT, INSERT, DELETE)

Run this query:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'feedback', 'images')
ORDER BY tablename, cmd;
```

### Step 3: Re-run Tests

After cleanup, run the RLS tests again:
```bash
npm run test:rls
```

## Why This Matters

**Duplicate policies can cause:**
1. **Conflicting behavior** - Multiple policies may evaluate differently
2. **Performance issues** - PostgreSQL evaluates all policies
3. **Unpredictable results** - Hard to debug which policy is being used
4. **Security risks** - One policy might be more permissive than intended

## Expected Result After Cleanup

After cleanup, each table should have exactly:
- **profiles**: SELECT, INSERT, UPDATE (3 policies)
- **feedback**: SELECT, INSERT, UPDATE (3 policies)
- **images**: SELECT, INSERT, DELETE (3 policies)

**Total: 9 policies** (3 per table)

## Verification Checklist

After cleanup:
- [ ] profiles table has exactly 3 policies
- [ ] feedback table has exactly 3 policies
- [ ] images table has exactly 3 policies
- [ ] All policies use `auth.uid() = user_id`
- [ ] RLS tests pass: `npm run test:rls`

## If Issues Persist

If tests still fail after cleanup:
1. Check that `auth.uid()` returns correct values
2. Verify no conflicting policies remain
3. Check Supabase logs for policy evaluation errors
4. See `docs/RLS_TROUBLESHOOTING.md` for more help





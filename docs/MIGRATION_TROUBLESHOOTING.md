# Migration Troubleshooting Guide

## Common Migration Errors and Solutions

### Error: "policy already exists"

**Error Message:**
```
ERROR: 42710: policy "Users can view own focus group feedback" for table "focus_group_feedback" already exists
```

**Solution:**
The migration files have been updated to be **idempotent** (safe to run multiple times). They now include `DROP POLICY IF EXISTS` statements before creating policies.

**What to do:**
1. Use the updated migration files (they now drop existing policies first)
2. Or manually drop the existing policies before running the migration:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own focus group feedback" ON focus_group_feedback;
DROP POLICY IF EXISTS "Users can insert own focus group feedback" ON focus_group_feedback;
DROP POLICY IF EXISTS "Users can update own focus group feedback" ON focus_group_feedback;
DROP POLICY IF EXISTS "Admins can view all focus group feedback" ON focus_group_feedback;
-- ... (repeat for all policies)
```

Then re-run the migration file.

### Error: "relation already exists"

**Error Message:**
```
ERROR: relation "focus_group_feedback" already exists
```

**Solution:**
This is fine! The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe. The error might appear if you're running the migration a second time, but the table creation will be skipped.

**What to do:**
- If you see this error, the table already exists - that's okay
- Continue with the rest of the migration (policies, indexes, etc.)
- Or skip the table creation part and only run the policies/indexes section

### Error: "column already exists"

**Error Message:**
```
ERROR: column "status" of relation "profiles" already exists
```

**Solution:**
The migration uses `ADD COLUMN IF NOT EXISTS`, so this shouldn't happen. If it does:

**What to do:**
- The column already exists - that's fine
- Skip that part of the migration
- Continue with the rest

### Error: "permission denied"

**Error Message:**
```
ERROR: permission denied for table "focus_group_feedback"
```

**Solution:**
This usually means RLS policies are blocking access, or the user doesn't have the right permissions.

**What to do:**
1. Ensure you're running migrations in the Supabase SQL Editor (not via API)
2. The SQL Editor runs with full permissions
3. Check that RLS is enabled but policies allow the operation

### Error: "syntax error"

**Error Message:**
```
ERROR: syntax error at or near "..."
```

**Solution:**
This usually means:
- The migration file was copied incorrectly
- Missing semicolons
- Special characters were corrupted

**What to do:**
1. Copy the entire migration file again
2. Ensure all semicolons are present
3. Check for any special characters that might have been corrupted
4. Try running the migration in smaller chunks

## Migration Execution Order

Always run migrations in this order:

1. **`migration_focus_group_status_week.sql`**
   - Adds columns to existing `profiles` table
   - Safe to run first

2. **`migration_focus_group_tables.sql`**
   - Creates `focus_group_feedback` and `focus_group_uploads` tables
   - Requires `profiles` table to exist

3. **`migration_focus_group_messages.sql`**
   - Creates `focus_group_messages` table
   - Can be run independently

## Verifying Migrations

After running migrations, verify they worked:

```bash
npm run verify-migrations
```

Or manually check in Supabase:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages');

-- Check columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('status', 'current_week');

-- Check policies exist
SELECT policyname 
FROM pg_policies 
WHERE tablename IN ('focus_group_feedback', 'focus_group_uploads', 'focus_group_messages');
```

## Idempotent Migrations

All migration files are now **idempotent**, meaning:
- ✅ Safe to run multiple times
- ✅ Won't create duplicates
- ✅ Will update existing structures if needed

The migrations use:
- `CREATE TABLE IF NOT EXISTS`
- `ADD COLUMN IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `DROP POLICY IF EXISTS` (before creating policies)

## Need Help?

If you continue to have issues:
1. Check the Supabase logs for detailed error messages
2. Verify you're using the latest migration files
3. Try running migrations one section at a time
4. Check that all prerequisites are met (base schema, etc.)








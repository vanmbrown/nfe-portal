# Focus Group Setup Verification Guide

## Quick Verification

Run the comprehensive verification query to check if everything is set up correctly:

**File**: `supabase/verify_focus_group_setup.sql`

### How to Use

1. Open Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy the entire contents of `supabase/verify_focus_group_setup.sql`
4. Paste into SQL Editor
5. Click "Run" (Ctrl+Enter)

### What It Checks

The verification query checks 8 different aspects:

1. **Tables Exist** - Verifies `focus_group_feedback`, `focus_group_uploads`, and `focus_group_messages` tables exist
2. **Columns Exist** - Verifies `status` and `current_week` columns exist in `profiles` table
3. **Indexes Exist** - Verifies all performance indexes are created
4. **RLS Enabled** - Verifies Row Level Security is enabled on all tables
5. **RLS Policies Exist** - Lists all existing policies
6. **Expected Policies** - Compares expected vs actual policies (12 total)
7. **Summary Report** - Provides counts of found vs expected items
8. **Pass/Fail Status** - Overall status check

### Expected Results

#### ✅ Success Indicators:
- **Tables**: 3 tables found (focus_group_feedback, focus_group_uploads, focus_group_messages)
- **Columns**: 2 columns found (status, current_week)
- **RLS Enabled**: 3 tables with RLS enabled
- **Policies**: 12+ policies found
- **Overall Status**: "✅ ALL CHECKS PASSED - Setup is complete!"

#### ❌ Failure Indicators:
- Missing tables
- Missing columns
- RLS not enabled
- Missing policies
- **Overall Status**: "❌ SOME CHECKS FAILED - Review the detailed results above"

### Understanding the Results

Each section returns a result set showing:
- **check_type**: What is being checked
- **table_name/column_name/index_name/policy_name**: The item being verified
- **status**: ✅ EXISTS or ❌ MISSING

### Troubleshooting

If checks fail:

1. **Missing Tables**: Run the table creation migrations:
   - `migration_focus_group_tables.sql`
   - `migration_focus_group_messages.sql`

2. **Missing Columns**: Run:
   - `migration_focus_group_status_week.sql`

3. **Missing Policies**: The policies section will show which ones are missing. Re-run the relevant migration file.

4. **RLS Not Enabled**: This should be automatic, but you can manually enable:
   ```sql
   ALTER TABLE focus_group_feedback ENABLE ROW LEVEL SECURITY;
   ALTER TABLE focus_group_uploads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE focus_group_messages ENABLE ROW LEVEL SECURITY;
   ```

### Quick Status Check

For a quick pass/fail, scroll to the last result set (section 8). It will show:
- ✅ **ALL CHECKS PASSED** - You're good to go!
- ❌ **SOME CHECKS FAILED** - Review the detailed results above

### Alternative: Use Verification Script

You can also use the Node.js verification script:

```bash
npm run verify-migrations
```

This provides a simpler output but requires your environment variables to be set up.








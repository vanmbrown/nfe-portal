# Focus Group Profile Schema Migration Guide

## Overview

This document describes the comprehensive profile schema update for the NFE Focus Group Portal. The new schema includes 8 major sections with over 40 fields covering demographic data, routines, financial commitment, problem validation, language/identity, pain points, influence, and consent.

## Migration Steps

### 1. Execute Database Migration

Run the migration SQL file in your Supabase SQL Editor:

```sql
-- File: supabase/migration_add_profile_fields.sql
```

**Steps:**
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy and paste the entire contents of `supabase/migration_add_profile_fields.sql`
5. Click **"Run"** (or press Ctrl+Enter)
6. Verify success: You should see "Success. No rows returned"

### 2. Verify Migration

Check that all new columns were added:

1. In Supabase: **Table Editor** → `profiles` table
2. Verify you see all new columns listed in the schema
3. Check that indexes were created (optional, for performance)

### 3. Test the Form

1. Navigate to `/focus-group/profile`
2. Verify all sections are visible and collapsible
3. Fill out required fields (marked with *)
4. Test saving the profile
5. Verify data is saved correctly in Supabase

## Schema Structure

### I. Demographic & Foundational Data
- `age_range` (required)
- `fitzpatrick_skin_tone` (required)
- `gender_identity` (optional)
- `ethnic_background` (optional)
- `skin_type` (optional)
- `top_concerns` (required, array)
- `lifestyle` (optional, array)
- `climate_exposure` (optional)
- `uv_exposure` (optional)
- `sleep_quality` (optional)
- `stress_level` (optional)

### II. Current Routine & Ritual
- `current_routine` (optional, text)
- `routine_frequency` (optional)
- `known_sensitivities` (optional)
- `product_use_history` (optional)
- `ideal_routine` (optional)
- `ideal_product` (optional)
- `routine_placement_insight` (optional)

### III. Financial Commitment & Value Perception
- `avg_spend_per_item` (optional, numeric)
- `annual_skincare_spend` (optional, numeric)
- `max_spend_motivation` (optional, text)
- `value_stickiness` (optional, text)
- `pricing_threshold_proof` (optional, text)
- `category_premium_insight` (optional, text)

### IV. Problem Validation & Performance Expectations
- `unmet_need` (optional, text)
- `money_spent_trying` (optional, text)
- `performance_expectation` (optional, text)
- `drop_off_reason` (optional, text)

### V. Language, Identity & Brand Association
- `elixir_association` (optional, text)
- `elixir_ideal_user` (optional, text)
- `favorite_brand` (optional, text)
- `favorite_brand_reason` (optional, text)

### VI. Pain Point & Ingredient Sophistication
- `specific_pain_point` (optional, text)
- `ingredient_awareness` (optional, text)

### VII. Influence, Advocacy & Effort
- `research_effort_score` (optional, 1-10)
- `influence_count` (optional, integer)
- `brand_switch_influence` (optional, boolean)

### VIII. Participation & Consent
- `image_consent` (required, boolean)
- `marketing_consent` (optional, boolean)
- `data_use_consent` (optional, boolean)

### Admin/Cohort Metadata (Backend Only)
- `cohort_name` (optional)
- `participation_status` (default: 'active')
- `uploads_count` (default: 0)
- `last_submission` (optional, timestamp)
- `has_follow_up_survey` (default: false)

## Form Features

### Collapsible Sections
All sections (except required foundational and consent) are collapsible by default:
- **Open by default:** Foundational Data, Consent
- **Closed by default:** All other sections

Users can expand/collapse sections as needed to reduce visual clutter.

### Field Validation
- Required fields are marked with red asterisk (*)
- All optional fields can be left blank
- Form validates required fields before submission
- Numeric fields have appropriate min/max constraints

### User Experience
- Clear section descriptions
- Helpful placeholder text
- Consistent styling
- Accessible keyboard navigation
- Mobile-responsive layout

## Data Export

All profile data can be exported from Supabase:
1. **Supabase Dashboard** → Table Editor → `profiles` → Export CSV
2. **SQL Query** for custom exports
3. **Admin Dashboard** (future feature) for filtered exports

## Backward Compatibility

- Existing profiles will have `NULL` values for new fields
- Old profile data remains intact
- Form handles both new and existing profiles gracefully
- No data migration needed for existing users

## Troubleshooting

### Migration Errors

**"relation already exists"**
- Some columns may already exist - that's fine
- The migration uses `IF NOT EXISTS` to handle this

**"permission denied"**
- Ensure you're using the SQL Editor (not API)
- SQL Editor has full permissions

**"syntax error"**
- Ensure you copied the entire migration file
- Check for missing semicolons

### Form Errors

**"Could not find the table 'public.profiles'"**
- Run the base schema first (`supabase/schema.sql`)
- Then run the migration

**Fields not saving**
- Check browser console for errors
- Verify RLS policies allow updates
- Ensure user is authenticated

## Next Steps

1. ✅ Execute migration SQL
2. ✅ Test form submission
3. ✅ Verify data in Supabase
4. ⏳ Test data export functionality
5. ⏳ Build admin dashboard for viewing profiles
6. ⏳ Create analytics queries for research insights

## Support

For issues or questions:
1. Check Supabase logs for database errors
2. Check browser console for client errors
3. Verify environment variables are set correctly
4. Review RLS policies if data access issues occur









# Admin Access Guide - Focus Group User Profiles

## Overview

This guide explains how administrators can safely view Focus Group participant profile information and feedback data.

## Access Methods

### Option 1: Supabase Dashboard (Recommended - Easiest)

The simplest way to view user profiles and feedback is directly through the Supabase Dashboard.

#### Steps:

1. **Log in to Supabase**
   - Go to your Supabase project dashboard
   - Navigate to: https://supabase.com/dashboard

2. **Access Table Editor**
   - In the left sidebar, click **"Table Editor"**
   - This shows all your database tables

3. **View Participant Profiles**
   - Click on the **`profiles`** table
   - This displays all participant information including:
     - `user_id` - Links to auth.users
     - `age_range` - Participant age range
     - `top_concerns` - Array of skin concerns
     - `skin_type` - Dry, Oily, Combination, Normal, Sensitive
     - `created_at` - When they joined
     - All other profile fields collected in the form

4. **View Feedback Entries**
   - Click on the **`feedback`** table
   - This shows all weekly feedback submissions:
     - `user_id` - Links to the participant
     - `week_number` - Which week the feedback is for
     - `hydration_rating` - Rating 1-5
     - `tone_rating` - Rating 1-5
     - `texture_rating` - Rating 1-5
     - `overall_rating` - Rating 1-5
     - `notes` - Combined text from all form fields
     - `created_at` - Submission timestamp

5. **Join Data (Optional)**
   - Use the `user_id` field to link profiles to feedback
   - You can write SQL queries in the SQL Editor to join tables:
   ```sql
   SELECT 
     p.user_id,
     p.age_range,
     p.top_concerns,
     f.week_number,
     f.overall_rating,
     f.created_at
   FROM profiles p
   LEFT JOIN feedback f ON p.user_id = f.user_id
   ORDER BY f.created_at DESC;
   ```

#### Advantages:
- ✅ No code changes required
- ✅ Direct database access
- ✅ Can export data to CSV
- ✅ Can write custom SQL queries
- ✅ Real-time data viewing

---

### Option 2: In-App Admin Dashboard

A protected admin dashboard is available at `/focus-group/admin` for viewing participant data within the application.

#### Access Requirements:

1. **Set Admin Status**
   - Your profile must have `is_admin = TRUE` in the `profiles` table
   - See `docs/ADMIN_DASHBOARD_SETUP.md` for setup instructions

2. **Navigate to Dashboard**
   - Log in at `/focus-group/login`
   - Navigate to `/focus-group/admin`
   - Non-admin users are automatically redirected

#### Features:

- **Summary Statistics**
  - Total Participants
  - Total Feedback Entries
  - Average Satisfaction Rating

- **Participants Table**
  - User ID (truncated)
  - Age Range
  - Top Concerns
  - Join Date
  - Number of Feedback Entries
  - Latest Rating
  - Last Submission Date

- **Recent Feedback Table**
  - Last 20 feedback entries
  - Week Number
  - All rating fields (Hydration, Tone, Texture, Overall)
  - Submission Date

#### Security:

- ✅ Authentication required
- ✅ Admin-only access (checks `is_admin` flag)
- ✅ Read-only (no data modification)
- ✅ Automatic redirect for non-admins

---

## Data Structure

### Profiles Table

Contains all participant demographic and preference data:

**Key Fields:**
- `id` - Profile UUID
- `user_id` - Links to auth.users
- `age_range` - '18-25', '26-35', '36-45', '46-55', '56+'
- `fitzpatrick_skin_tone` - 1-6
- `skin_type` - 'Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'
- `top_concerns` - Array of concerns
- `lifestyle` - Array of lifestyle factors
- `created_at` - Profile creation timestamp
- `updated_at` - Last update timestamp
- `is_admin` - Boolean flag for admin access

**Full Schema:** See `supabase/schema.sql` and `supabase/migration_add_profile_fields.sql`

### Feedback Table

Contains weekly feedback submissions:

**Key Fields:**
- `id` - Feedback UUID
- `user_id` - Links to auth.users (same as profiles.user_id)
- `week_number` - Week of the study (1, 2, 3, etc.)
- `hydration_rating` - 1-5
- `tone_rating` - 1-5
- `texture_rating` - 1-5
- `overall_rating` - 1-5
- `notes` - Combined text from form fields (product_usage, perceived_changes, concerns, etc.)
- `created_at` - Submission timestamp

**Note:** The `notes` field contains combined text from multiple form fields separated by newlines.

---

## Best Practices

### Data Privacy

- ✅ Only access data you need
- ✅ Don't share participant data outside authorized team
- ✅ Use read-only access when possible
- ✅ Respect participant consent flags (`image_consent`, `marketing_consent`)

### Data Export

**From Supabase Dashboard:**
1. Open the table you want to export
2. Click the "..." menu (top right)
3. Select "Export" → "CSV"
4. Download the file

**From SQL Editor:**
```sql
-- Export profiles to CSV
COPY (
  SELECT * FROM profiles
) TO STDOUT WITH CSV HEADER;
```

### Querying Data

**Example: Find participants with high satisfaction:**
```sql
SELECT 
  p.user_id,
  p.age_range,
  AVG(f.overall_rating) as avg_rating,
  COUNT(f.id) as feedback_count
FROM profiles p
JOIN feedback f ON p.user_id = f.user_id
GROUP BY p.user_id, p.age_range
HAVING AVG(f.overall_rating) >= 4
ORDER BY avg_rating DESC;
```

**Example: Find participants who haven't submitted feedback:**
```sql
SELECT p.*
FROM profiles p
LEFT JOIN feedback f ON p.user_id = f.user_id
WHERE f.id IS NULL;
```

---

## Troubleshooting

### "Can't see any data"

- Check that you're logged into the correct Supabase project
- Verify the table names match (`profiles`, `feedback`)
- Check RLS policies if using client-side access

### "Access denied" in Admin Dashboard

- Verify your profile has `is_admin = TRUE`
- Check that you're logged in
- Clear browser cache and try again

### "Invalid Date" in feedback history

- This has been fixed in the latest update
- Dates now use `created_at` field with safe fallback
- See `src/app/focus-group/feedback/page.tsx` for implementation

---

## Security Notes

### Row-Level Security (RLS)

The database uses RLS policies to protect data:

- **Profiles:** Users can only see their own profile
- **Feedback:** Users can only see their own feedback
- **Admin Access:** Requires `is_admin = TRUE` flag

### Admin Flag

The `is_admin` column in `profiles` table controls admin access:

- Default: `FALSE` (all new profiles)
- Must be manually set to `TRUE` in Supabase Dashboard
- Only users with this flag can access `/focus-group/admin`

### API Security

- All API routes require authentication
- Admin routes check `is_admin` flag
- No write operations from admin dashboard (read-only)

---

## Support

For questions or issues:
1. Check this documentation
2. Review `docs/ADMIN_DASHBOARD_SETUP.md`
3. Check browser console for errors
4. Verify Supabase connection and RLS policies

---

**Last Updated:** December 2024  
**Status:** ✅ Current


# RLS Policy Testing Guide

This guide helps you test Row Level Security (RLS) policies to ensure proper data isolation between users.

## Prerequisites

1. Access to Supabase Dashboard
2. Ability to create test users
3. SQL Editor access in Supabase

## Current RLS Policies

### Profiles Table
- ✅ Users can SELECT their own profile (`auth.uid() = user_id`)
- ✅ Users can INSERT their own profile (`auth.uid() = user_id`)
- ✅ Users can UPDATE their own profile (`auth.uid() = user_id`)
- ❌ No DELETE policy (users cannot delete profiles)

### Feedback Table
- ✅ Users can SELECT their own feedback (`auth.uid() = user_id`)
- ✅ Users can INSERT their own feedback (`auth.uid() = user_id`)
- ✅ Users can UPDATE their own feedback (`auth.uid() = user_id`)
- ❌ No DELETE policy (users cannot delete feedback)

### Images Table
- ✅ Users can SELECT their own images (`auth.uid() = user_id`)
- ✅ Users can INSERT their own images (`auth.uid() = user_id`)
- ✅ Users can DELETE their own images (`auth.uid() = user_id`)
- ❌ No UPDATE policy (users cannot update images)

## Test Plan

### Test 1: User Can Only See Own Profile

**Steps:**
1. Create two test users: `testuser1@example.com` and `testuser2@example.com`
2. Create profiles for both users
3. Log in as `testuser1@example.com`
4. Query profiles table
5. **Expected**: Only see `testuser1`'s profile

**SQL Test:**
```sql
-- As testuser1, this should only return testuser1's profile
SELECT * FROM profiles;
```

### Test 2: User Cannot See Other User's Feedback

**Steps:**
1. Create feedback entries for both test users
2. Log in as `testuser1@example.com`
3. Query feedback table
4. **Expected**: Only see `testuser1`'s feedback

**SQL Test:**
```sql
-- As testuser1, this should only return testuser1's feedback
SELECT * FROM feedback;
```

### Test 3: User Cannot See Other User's Images

**Steps:**
1. Create image entries for both test users
2. Log in as `testuser1@example.com`
3. Query images table
4. **Expected**: Only see `testuser1`'s images

**SQL Test:**
```sql
-- As testuser1, this should only return testuser1's images
SELECT * FROM images;
```

### Test 4: User Cannot Insert Data for Another User

**Steps:**
1. Log in as `testuser1@example.com`
2. Try to insert feedback with `user_id` of `testuser2`
3. **Expected**: INSERT should fail or be rejected

**SQL Test:**
```sql
-- This should fail with RLS policy violation
INSERT INTO feedback (user_id, week_number, hydration_rating, tone_rating, texture_rating, overall_rating)
VALUES ('testuser2-uuid', 1, 3, 3, 3, 3);
-- Expected: Error about RLS policy violation
```

### Test 5: User Cannot Update Another User's Data

**Steps:**
1. Log in as `testuser1@example.com`
2. Try to update `testuser2`'s feedback
3. **Expected**: UPDATE should fail or affect 0 rows

**SQL Test:**
```sql
-- This should affect 0 rows due to RLS
UPDATE feedback 
SET notes = 'Hacked!' 
WHERE user_id = 'testuser2-uuid';
-- Expected: 0 rows affected
```

## Manual Testing via Application

### Test Scenario 1: Profile Isolation

1. **Setup**: Create two user accounts
2. **Action**: Log in as User A, complete profile
3. **Action**: Log in as User B, complete profile
4. **Verify**: User B cannot see User A's profile data
5. **Verify**: User A cannot see User B's profile data

### Test Scenario 2: Feedback Isolation

1. **Setup**: Both users have profiles
2. **Action**: User A submits feedback for week 1
3. **Action**: User B submits feedback for week 1
4. **Verify**: User A only sees their own feedback
5. **Verify**: User B only sees their own feedback

### Test Scenario 3: Image Upload Isolation

1. **Setup**: Both users have profiles
2. **Action**: User A uploads a "before" image
3. **Action**: User B uploads a "before" image
4. **Verify**: User A only sees their own images
5. **Verify**: User B only sees their own images

## Automated Testing Script

See `scripts/test-rls-policies.js` for an automated test script that can be run with Node.js.

## Verification Checklist

- [ ] User A can view their own profile
- [ ] User A cannot view User B's profile
- [ ] User A can create their own feedback
- [ ] User A cannot create feedback for User B
- [ ] User A can view their own feedback
- [ ] User A cannot view User B's feedback
- [ ] User A can upload their own images
- [ ] User A cannot view User B's images
- [ ] User A can delete their own images
- [ ] User A cannot delete User B's images

## Common Issues

### Issue: Users can see all data
**Cause**: RLS not enabled on table
**Fix**: Run `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

### Issue: Users cannot see their own data
**Cause**: Policy condition incorrect
**Fix**: Verify policy uses `auth.uid() = user_id`

### Issue: INSERT fails even with correct user_id
**Cause**: Policy uses `USING` instead of `WITH CHECK` for INSERT
**Fix**: INSERT policies must use `WITH CHECK`, not `USING`

## Next Steps

After verifying RLS policies work correctly:
1. Document any issues found
2. Update policies if needed
3. Add admin policies if required (using `is_admin` flag)
4. Test admin access separately





-- Fix Infinite Recursion in Profiles Policy
-- The recursive issue is: checking `profiles` to see if you can view `profiles`.
-- We need to break this loop by using a direct check or a separate admin table/function.
-- For now, we'll use a simplified policy that avoids the self-join recursion where possible,
-- or relies on the user being able to view their OWN profile first.

-- 1. Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 2. Re-create "Users can view own profile" (Simple, no recursion)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (
  user_id = auth.uid()
);

-- 3. Re-create "Admins can view all profiles" WITHOUT direct recursion on the same row being checked.
-- To avoid recursion, we query the profiles table *separately* for the auth.uid()'s admin status.
-- However, querying the table you are securing *inside* the policy for that table IS what causes recursion.
--
-- WORKAROUND: We can use a SECURITY DEFINER function to check admin status safely.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now use the function in the policy.
-- Note: Supabase/Postgres might still detect recursion if the function queries the table with RLS enabled.
-- To be safe, we grant the function access to bypass RLS or ensure it doesn't trigger the loop.
-- A simpler fix for RLS recursion on the *same* table is often to just allow the user to see *themselves* first.

-- Let's try the policy using the function which runs with owner privileges (bypassing RLS)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  is_admin()
);

-- Also fix other tables to use this safe function
DROP POLICY IF EXISTS "Admins can view all focus group feedback" ON focus_group_feedback;
CREATE POLICY "Admins can view all focus group feedback"
ON focus_group_feedback FOR SELECT
USING ( is_admin() );

DROP POLICY IF EXISTS "Admins can view all focus group uploads" ON focus_group_uploads;
CREATE POLICY "Admins can view all focus group uploads"
ON focus_group_uploads FOR SELECT
USING ( is_admin() );

DROP POLICY IF EXISTS "Admins can update focus group uploads" ON focus_group_uploads;
CREATE POLICY "Admins can update focus group uploads"
ON focus_group_uploads FOR UPDATE
USING ( is_admin() );

-- And messages
DROP POLICY IF EXISTS "Admins can view all messages" ON focus_group_messages;
CREATE POLICY "Admins can view all messages"
ON focus_group_messages FOR SELECT
USING ( is_admin() );




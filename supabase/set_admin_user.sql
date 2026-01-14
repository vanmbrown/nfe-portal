-- Fix Admin Status for Specific User
-- Replace 'vanessa@nfebeauty.com' with the user email if needed

UPDATE profiles
SET is_admin = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'vanessa@nfebeauty.com'
);

-- Ensure the RLS policy for admins exists correctly
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);




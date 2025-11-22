-- Set is_admin = true for your profile
-- Replace 'YOUR_PROFILE_ID' with your actual profile ID from the debug page
-- Your profile ID from debug: ab0f7b20-2829-4f69-88cf-1801d84530dd

UPDATE profiles
SET is_admin = true
WHERE id = 'ab0f7b20-2829-4f69-88cf-1801d84530dd';

-- Or, if you prefer to set it by email (if you know your user email):
-- UPDATE profiles
-- SET is_admin = true
-- WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email = 'vanessa@nfebeauty.com'
-- );




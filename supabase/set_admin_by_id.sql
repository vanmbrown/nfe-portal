-- Set Admin Status by User ID
-- Explicitly setting is_admin = true for user ID: ab0f7b20-2829-4f69-88cf-1801d84530dd

UPDATE profiles
SET is_admin = true
WHERE user_id = 'ab0f7b20-2829-4f69-88cf-1801d84530dd';

-- Verify the update
SELECT user_id, email, is_admin 
FROM profiles 
WHERE user_id = 'ab0f7b20-2829-4f69-88cf-1801d84530dd';




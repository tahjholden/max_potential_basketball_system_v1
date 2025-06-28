-- Fix coach record for thype45@yahoo.com
-- This script updates the auth_uid for the coach record to match the correct user

-- First, let's see what coach records exist
SELECT id, first_name, last_name, email, auth_uid, is_admin 
FROM coaches 
WHERE email = 'thype45@yahoo.com' OR first_name = 'Tahj' AND last_name = 'Holden';

-- Update the coach record for thype45@yahoo.com to have the correct auth_uid
-- The user ID for thype45@yahoo.com is: 75d4ccd6-d2bd-43c4-8f7f-495fb96502d1
UPDATE coaches 
SET auth_uid = '75d4ccd6-d2bd-43c4-8f7f-495fb96502d1'
WHERE email = 'thype45@yahoo.com';

-- If there's no email field or the email is different, update by name
-- UPDATE coaches 
-- SET auth_uid = '75d4ccd6-d2bd-43c4-8f7f-495fb96502d1'
-- WHERE first_name = 'Tahj' AND last_name = 'Holden' AND auth_uid != '75d4ccd6-d2bd-43c4-8f7f-495fb96502d1';

-- Verify the fix
SELECT id, first_name, last_name, email, auth_uid, is_admin 
FROM coaches 
WHERE auth_uid = '75d4ccd6-d2bd-43c4-8f7f-495fb96502d1'; 
-- Assign Admin Role to Specific User

-- This script assigns the admin role to a specific user by their UID
DO $$
DECLARE
  admin_role_id UUID;
  target_user_id UUID := '5371e2d5-0697-46c0-bf5b-aab2e4d88b58'; -- The specific user UID to make admin
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- If admin role exists, assign it to the target user
  IF admin_role_id IS NOT NULL THEN
    -- Check if the user already has the admin role
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE profile_id = target_user_id AND role_id = admin_role_id) THEN
      -- Insert the admin role for the target user
      INSERT INTO user_roles (profile_id, role_id)
      VALUES (target_user_id, admin_role_id);
      
      RAISE NOTICE 'Admin role successfully assigned to user %', target_user_id;
    ELSE
      RAISE NOTICE 'User % already has admin role', target_user_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Admin role not found in the database';
  END IF;
END;
$$;
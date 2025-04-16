-- Assign Admin Role Migration

-- First, get the admin role ID
DO $$
DECLARE
  admin_role_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Get the admin user ID from the profiles table
  SELECT id INTO admin_user_id FROM profiles WHERE email = 'admin@example.com' LIMIT 1;
  
  -- If admin user not found, try to get any verified user
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM profiles WHERE is_verified = true LIMIT 1;
  END IF;
  
  -- If admin role exists, assign it to the admin user
  IF admin_role_id IS NOT NULL THEN
    -- Check if the admin user already has the admin role
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE profile_id = admin_user_id AND role_id = admin_role_id) THEN
      -- Insert the admin role for the admin user
      INSERT INTO user_roles (profile_id, role_id)
      VALUES (admin_user_id, admin_role_id);
    END IF;
  END IF;
END;
$$;
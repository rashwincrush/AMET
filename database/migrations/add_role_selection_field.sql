-- Migration to add role_setup_complete column to profiles for OAuth flow
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role_setup_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_mentee BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have role_setup_complete=true
-- since they've already gone through the signup flow
UPDATE profiles
SET role_setup_complete = TRUE
WHERE id IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN profiles.role_setup_complete IS 'Indicates whether the user has completed the role selection step after OAuth signup';
COMMENT ON COLUMN profiles.is_mentee IS 'Indicates whether the user is registered as a mentee'; 
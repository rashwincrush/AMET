-- Migration to add Two-Factor Authentication related columns

-- Add 2FA related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recovery_email TEXT,
ADD COLUMN IF NOT EXISTS trusted_devices JSONB DEFAULT '[]'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled ON profiles(two_factor_enabled);

-- Add audit log entry types for 2FA activities
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'activity_log_type' 
    ) THEN
        CREATE TYPE activity_log_type AS ENUM (
            'login', 'logout', 'profile_update', 'role_change',
            'event_create', 'event_update', 'event_delete',
            'job_create', 'job_update', 'job_delete',
            '2fa_enable', '2fa_disable', '2fa_recovery'
        );
    ELSE
        -- Type exists, so alter it to add new values if they don't exist
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS '2fa_enable';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS '2fa_disable';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS '2fa_recovery';
    END IF;
END$$;

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.two_factor_enabled IS 'Whether two-factor authentication is enabled for this user';
COMMENT ON COLUMN profiles.recovery_email IS 'Backup email for account recovery if 2FA is enabled';
COMMENT ON COLUMN profiles.trusted_devices IS 'List of devices that are trusted for 2FA (contains device fingerprints and expiry)';

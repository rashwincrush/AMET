-- Combined migration for Two-Factor Authentication and CSV Import/Export features

-- 1. Add 2FA related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recovery_email TEXT,
ADD COLUMN IF NOT EXISTS trusted_devices JSONB DEFAULT '[]'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled ON profiles(two_factor_enabled);

-- 2. Create recovery_codes table for 2FA functionality
CREATE TABLE IF NOT EXISTS recovery_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for recovery_codes
CREATE INDEX IF NOT EXISTS idx_recovery_codes_user_id ON recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_code ON recovery_codes(code);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_expires_at ON recovery_codes(expires_at);

-- Add RLS policies for recovery_codes
ALTER TABLE recovery_codes ENABLE ROW LEVEL SECURITY;

-- Only the user themselves can access their recovery codes
CREATE POLICY "Users can access their own recovery codes"
  ON recovery_codes
  FOR ALL
  USING (auth.uid() = user_id);

-- Admins can access all recovery codes
CREATE POLICY "Admins can access all recovery codes"
  ON recovery_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- 3. Update activity_logs to include new activity types
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
            '2fa_enable', '2fa_disable', '2fa_recovery',
            'user_import', 'user_export',
            'event_import', 'event_export',
            'job_import', 'job_export'
        );
    ELSE
        -- Type exists, so alter it to add new values if they don't exist
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS '2fa_enable';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS '2fa_disable';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS '2fa_recovery';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS 'user_import';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS 'user_export';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS 'event_import';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS 'event_export';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS 'job_import';
        ALTER TYPE activity_log_type ADD VALUE IF NOT EXISTS 'job_export';
    END IF;
END$$;

-- 4. Add comments to explain the new columns and tables
COMMENT ON COLUMN profiles.two_factor_enabled IS 'Whether two-factor authentication is enabled for this user';
COMMENT ON COLUMN profiles.recovery_email IS 'Backup email for account recovery if 2FA is enabled';
COMMENT ON COLUMN profiles.trusted_devices IS 'List of devices that are trusted for 2FA (contains device fingerprints and expiry)';
COMMENT ON TABLE recovery_codes IS 'Stores temporary recovery codes for two-factor authentication';

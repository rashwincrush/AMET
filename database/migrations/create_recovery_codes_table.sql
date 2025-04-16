-- Migration to create recovery_codes table for 2FA functionality

-- Create recovery_codes table
CREATE TABLE IF NOT EXISTS recovery_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_recovery_codes_user_id ON recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_code ON recovery_codes(code);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_expires_at ON recovery_codes(expires_at);

-- Add RLS policies
ALTER TABLE recovery_codes ENABLE ROW LEVEL SECURITY;

-- Only admins and the user themselves can access their recovery codes
CREATE POLICY "Users can access their own recovery codes"
  ON recovery_codes
  FOR ALL
  USING (auth.uid() = user_id);

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

-- Add comment to explain the table
COMMENT ON TABLE recovery_codes IS 'Stores temporary recovery codes for two-factor authentication';

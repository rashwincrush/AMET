-- Migration to add role verification status fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mentor_status TEXT CHECK (mentor_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mentee_status TEXT CHECK (mentee_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS alumni_verification_status TEXT CHECK (alumni_verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_document_url TEXT,
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add comment explaining the columns
COMMENT ON COLUMN profiles.mentor_status IS 'Status of mentor role verification';
COMMENT ON COLUMN profiles.mentee_status IS 'Status of mentee role verification';
COMMENT ON COLUMN profiles.alumni_verification_status IS 'Status of alumni verification';
COMMENT ON COLUMN profiles.verification_document_url IS 'URL to verification document uploaded by user';
COMMENT ON COLUMN profiles.verification_notes IS 'Notes from admin regarding verification';
COMMENT ON COLUMN profiles.verification_reviewed_by IS 'Admin who reviewed the verification';
COMMENT ON COLUMN profiles.verification_reviewed_at IS 'When the verification was reviewed'; 
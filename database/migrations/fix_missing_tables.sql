-- Fix missing tables and columns for the alumni management system

-- Add mentor-related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mentor_availability TEXT,
ADD COLUMN IF NOT EXISTS mentor_topics TEXT[];

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  job_type TEXT,
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  application_url TEXT,
  contact_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  posted_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active jobs
CREATE POLICY "Anyone can view active jobs" 
ON jobs FOR SELECT 
USING (is_active = TRUE);

-- Allow authenticated users to create jobs
CREATE POLICY "Authenticated users can create jobs" 
ON jobs FOR INSERT 
TO authenticated 
WITH CHECK (TRUE);

-- Allow users to update their own jobs
CREATE POLICY "Users can update their own jobs" 
ON jobs FOR UPDATE 
TO authenticated 
USING (posted_by = auth.uid());

-- Allow users to delete their own jobs
CREATE POLICY "Users can delete their own jobs" 
ON jobs FOR DELETE 
TO authenticated 
USING (posted_by = auth.uid());

-- Create RLS policies for activity_logs table
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create activity logs
CREATE POLICY "Authenticated users can create activity logs" 
ON activity_logs FOR INSERT 
TO authenticated 
WITH CHECK (TRUE);

-- Allow users to view their own activity logs
CREATE POLICY "Users can view their own activity logs" 
ON activity_logs FOR SELECT 
TO authenticated 
USING (profile_id = auth.uid());

-- Allow admins to view all activity logs (requires manual assignment of admin role)
CREATE POLICY "Admins can view all activity logs" 
ON activity_logs FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.profile_id = auth.uid() AND r.name IN ('admin', 'super_admin')
  )
);

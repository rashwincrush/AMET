-- Job Listings Schema
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  salary_range TEXT,
  contact_email TEXT NOT NULL,
  posted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on job_listings
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Policies for job_listings
-- Anyone can view job listings
CREATE POLICY "Anyone can view job listings" ON job_listings
  FOR SELECT USING (true);

-- Only authenticated users can insert job listings
CREATE POLICY "Authenticated users can insert job listings" ON job_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own job listings
CREATE POLICY "Users can update their own job listings" ON job_listings
  FOR UPDATE USING (auth.uid() = posted_by);

-- Users can delete their own job listings
CREATE POLICY "Users can delete their own job listings" ON job_listings
  FOR DELETE USING (auth.uid() = posted_by);

-- Create job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Enable RLS on job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for job_applications
-- Users can view their own applications
CREATE POLICY "Users can view their own applications" ON job_applications
  FOR SELECT USING (auth.uid() = applicant_id);

-- Job posters can view applications for their jobs
CREATE POLICY "Job posters can view applications for their jobs" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.posted_by = auth.uid()
    )
  );

-- Users can insert their own applications
CREATE POLICY "Users can insert their own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Users can update their own applications
CREATE POLICY "Users can update their own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = applicant_id);

-- Users can delete their own applications
CREATE POLICY "Users can delete their own applications" ON job_applications
  FOR DELETE USING (auth.uid() = applicant_id);
-- Complete Database Schema for Alumni Management System
-- This file combines all required database changes discussed in the conversation

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Schema
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  avatar_url TEXT,
  avatar_bucket TEXT,
  avatar_path TEXT,
  avatar_version TEXT,
  graduation_year INT,
  degree TEXT,
  major TEXT,
  current_company TEXT,
  current_position TEXT,
  location TEXT,
  bio TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  phone_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  is_mentee BOOLEAN DEFAULT FALSE,
  industry TEXT,
  role_setup_complete BOOLEAN DEFAULT FALSE,
  mentor_status TEXT CHECK (mentor_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  mentee_status TEXT CHECK (mentee_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  alumni_verification_status TEXT CHECK (alumni_verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  verification_document_url TEXT,
  verification_notes TEXT,
  verification_reviewed_by UUID REFERENCES profiles(id),
  verification_reviewed_at TIMESTAMP WITH TIME ZONE,
  student_id TEXT,
  search_vector tsvector,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  recovery_email TEXT,
  trusted_devices JSONB DEFAULT '[]'::jsonb,
  mentor_availability TEXT,
  mentor_topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Role Management
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrator role'),
('mentor', 'Mentor role'),
('mentee', 'Mentee role');

-- User Roles Schema
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);

-- Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for roles
CREATE POLICY "Admins can manage roles" ON roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

-- Policies for user_roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (profile_id = auth.uid());

-- Events Schema
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  virtual_meeting_link TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Creators can view their own events" ON events
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own events" ON events
  FOR DELETE USING (auth.uid() = creator_id);

-- Event Attendees Schema
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('registered', 'attended', 'cancelled')) DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- Enable RLS on event_attendees
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Policies for event_attendees
CREATE POLICY "Users can view their own attendance" ON event_attendees
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Event creators can view attendees" ON event_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = event_id AND events.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own attendance" ON event_attendees
  FOR UPDATE USING (auth.uid() = profile_id);

-- Job Listings Schema
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  salary_min NUMERIC,
  salary_max NUMERIC,
  application_url TEXT,
  contact_email TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on job_listings
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Policies for job_listings
CREATE POLICY "Anyone can view published job listings" ON job_listings
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Creators can view their own job listings" ON job_listings
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own job listings" ON job_listings
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own job listings" ON job_listings
  FOR DELETE USING (auth.uid() = creator_id);

-- Job Applications Schema
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT CHECK (status IN ('submitted', 'reviewed', 'interviewing', 'offered', 'rejected')) DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Enable RLS on job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for job_applications
CREATE POLICY "Users can view their own applications" ON job_applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Job creators can view applications" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_listings WHERE job_listings.id = job_id AND job_listings.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can submit applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Mentorship Programs Schema
CREATE TABLE IF NOT EXISTS mentorship_programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on mentorship_programs
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;

-- Policies for mentorship_programs
CREATE POLICY "Anyone can view active mentorship programs" ON mentorship_programs
  FOR SELECT USING (is_active = TRUE);

-- Mentorship Relationships Schema
CREATE TABLE IF NOT EXISTS mentorship_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id UUID REFERENCES mentorship_programs(id) ON DELETE SET NULL,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id, program_id)
);

-- Enable RLS on mentorship_relationships
ALTER TABLE mentorship_relationships ENABLE ROW LEVEL SECURITY;

-- Policies for mentorship_relationships
CREATE POLICY "Users can view their own mentorship relationships" ON mentorship_relationships
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can update their own mentorship relationships" ON mentorship_relationships
  FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for saved searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can only access their own saved searches
CREATE POLICY "Users can manage their own saved searches"
  ON saved_searches
  FOR ALL
  USING (auth.uid() = user_id);

-- Recovery codes table for 2FA functionality
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

-- Create mentors table if it doesn't exist (referenced by mentor_availability)
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  expertise TEXT[],
  years_of_experience INTEGER,
  max_mentees INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor_availability table
CREATE TABLE IF NOT EXISTS mentor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT time_range_check CHECK (start_time < end_time)
);

-- Create mentees table if it doesn't exist (referenced in the code)
CREATE TABLE IF NOT EXISTS mentees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
  career_goals TEXT,
  preferred_industry TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentorship_appointments table for the booked appointments
CREATE TABLE IF NOT EXISTS mentorship_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  availability_id UUID REFERENCES mentor_availability(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES mentees(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  notes TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  feedback_provided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on mentorship tables
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentees ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentors
CREATE POLICY "Users can view approved mentors" ON mentors
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own mentor profile" ON mentors
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for mentor_availability
CREATE POLICY "Anyone can view mentor availability" ON mentor_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentors WHERE mentors.id = mentor_id AND (mentors.status = 'approved' OR mentors.user_id = auth.uid())
    )
  );

CREATE POLICY "Mentors can manage their own availability" ON mentor_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM mentors WHERE mentors.id = mentor_id AND mentors.user_id = auth.uid()
    )
  );

-- RLS policies for mentees
CREATE POLICY "Users can view mentees they are mentoring" ON mentees
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM mentorship_relationships
      WHERE mentorship_relationships.mentee_id = user_id
      AND mentorship_relationships.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own mentee profile" ON mentees
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for mentorship_appointments
CREATE POLICY "Users can view their own appointments" ON mentorship_appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees WHERE mentees.id = mentee_id AND mentees.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM mentor_availability ma
      JOIN mentors m ON ma.mentor_id = m.id
      WHERE ma.id = availability_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentees can create appointments" ON mentorship_appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentees WHERE mentees.id = mentee_id AND mentees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own appointments" ON mentorship_appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mentees WHERE mentees.id = mentee_id AND mentees.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM mentor_availability ma
      JOIN mentors m ON ma.mentor_id = m.id
      WHERE ma.id = availability_id AND m.user_id = auth.uid()
    )
  );

-- Create function to update the search vector for profiles
CREATE OR REPLACE FUNCTION profiles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector = 
     setweight(to_tsvector('english', coalesce(NEW.first_name, '')), 'A') ||
     setweight(to_tsvector('english', coalesce(NEW.last_name, '')), 'A') ||
     setweight(to_tsvector('english', coalesce(NEW.major, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.current_company, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.current_position, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C') ||
     setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector on insert or update
CREATE TRIGGER profiles_search_vector_update
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION profiles_search_vector_update();

-- Create an index on the search vector
CREATE INDEX IF NOT EXISTS profiles_search_vector_idx ON profiles USING gin(search_vector);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorship_programs_updated_at
  BEFORE UPDATE ON mentorship_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorship_relationships_updated_at
  BEFORE UPDATE ON mentorship_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON mentors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_availability_updated_at
  BEFORE UPDATE ON mentor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentees_updated_at
  BEFORE UPDATE ON mentees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorship_appointments_updated_at
  BEFORE UPDATE ON mentorship_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_oauth_signup BOOLEAN;
BEGIN
  -- Determine if this is an OAuth signup or direct signup
  is_oauth_signup := NEW.app_metadata->>'provider' IN ('google', 'linkedin', 'github', 'facebook');
  
  -- For OAuth signups, role_setup_complete should be false
  -- For direct signups, role_setup_complete should be true
  INSERT INTO profiles (
    id, 
    email,
    first_name,
    last_name,
    role_setup_complete
  )
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NOT is_oauth_signup  -- true for direct signups, false for OAuth
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create or replace default storage buckets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'documents'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents', 'documents', true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'profile-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-images', 'profile-images', true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'event-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('event-images', 'event-images', true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'job-attachments'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('job-attachments', 'job-attachments', true);
  END IF;
END$$; 
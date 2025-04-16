-- Alumni Management System Database Schema

-- Comment out JWT configuration (these should be configured outside of this script)
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';
-- ALTER DATABASE postgres SET "app.jwt_exp" TO 3600;

-- User Profiles Schema
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role_setup_complete BOOLEAN DEFAULT FALSE
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
-- Users can view any profile
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create storage bucket for avatars
CREATE OR REPLACE FUNCTION create_avatar_bucket()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_avatar_bucket();

-- Achievements Schema
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  year INT,
  url TEXT,
  achievement_type TEXT CHECK (achievement_type IN ('professional', 'academic', 'personal', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements
-- Anyone can view achievements
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Users can update their own achievements
CREATE POLICY "Users can update their own achievements" ON achievements
  FOR ALL USING (auth.uid() = profile_id);

-- Events Schema
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- Anyone can view published events
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (is_published = TRUE);

-- Creators can view their own events
CREATE POLICY "Creators can view their own events" ON events
  FOR SELECT USING (auth.uid() = creator_id);

-- Creators can update their own events
CREATE POLICY "Creators can update their own events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own events
CREATE POLICY "Creators can delete their own events" ON events
  FOR DELETE USING (auth.uid() = creator_id);

-- Event Attendees Schema
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- Users can view their own attendance
CREATE POLICY "Users can view their own attendance" ON event_attendees
  FOR SELECT USING (auth.uid() = profile_id);

-- Event creators can view attendees for their events
CREATE POLICY "Event creators can view attendees" ON event_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = event_id AND events.creator_id = auth.uid()
    )
  );

-- Users can register for events
CREATE POLICY "Users can register for events" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Users can update their own attendance
CREATE POLICY "Users can update their own attendance" ON event_attendees
  FOR UPDATE USING (auth.uid() = profile_id);

-- Job Listings Schema
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- Anyone can view published job listings
CREATE POLICY "Anyone can view published job listings" ON job_listings
  FOR SELECT USING (is_published = TRUE);

-- Creators can view their own job listings
CREATE POLICY "Creators can view their own job listings" ON job_listings
  FOR SELECT USING (auth.uid() = creator_id);

-- Creators can update their own job listings
CREATE POLICY "Creators can update their own job listings" ON job_listings
  FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own job listings
CREATE POLICY "Creators can delete their own job listings" ON job_listings
  FOR DELETE USING (auth.uid() = creator_id);

-- Job Applications Schema
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- Users can view their own applications
CREATE POLICY "Users can view their own applications" ON job_applications
  FOR SELECT USING (auth.uid() = applicant_id);

-- Job creators can view applications for their jobs
CREATE POLICY "Job creators can view applications" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_listings WHERE job_listings.id = job_id AND job_listings.creator_id = auth.uid()
    )
  );

-- Users can submit applications
CREATE POLICY "Users can submit applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Mentorship Program Schema
CREATE TABLE IF NOT EXISTS mentorship_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- Anyone can view active mentorship programs
CREATE POLICY "Anyone can view active mentorship programs" ON mentorship_programs
  FOR SELECT USING (is_active = TRUE);

-- Mentorship Relationships Schema
CREATE TABLE IF NOT EXISTS mentorship_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
-- Users can view their own mentorship relationships
CREATE POLICY "Users can view their own mentorship relationships" ON mentorship_relationships
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Users can update their own mentorship relationships
CREATE POLICY "Users can update their own mentorship relationships" ON mentorship_relationships
  FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Roles Schema
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);

-- Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Policies for roles
-- Only admins can view roles
CREATE POLICY "Admins can view roles" ON roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Only admins can modify roles
CREATE POLICY "Admins can modify roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
-- Only admins can view all user roles
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = profile_id);

-- Only admins can modify user roles
CREATE POLICY "Admins can modify user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
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
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentorship_programs_updated_at
  BEFORE UPDATE ON mentorship_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentorship_relationships_updated_at
  BEFORE UPDATE ON mentorship_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

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
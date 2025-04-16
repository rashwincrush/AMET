-- Alumni Management System Supabase Migration Script
-- This script sets up the complete database schema with RBAC for the Alumni Management System

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Management
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);

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

-- Mentorship Relationships Schema
CREATE TABLE IF NOT EXISTS mentorship_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id UUID REFERENCES mentorship_programs(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, mentor_id, mentee_id)
);

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

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can view any profile
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for roles
-- Only admins can manage roles
CREATE POLICY "Admins can manage roles" ON roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Anyone can view roles
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

-- Policies for user_roles
-- Only admins can manage user roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (profile_id = auth.uid());

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

-- Users can update their own applications
CREATE POLICY "Users can update their own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = applicant_id);

-- Policies for mentorship_programs
-- Anyone can view mentorship programs
CREATE POLICY "Anyone can view mentorship programs" ON mentorship_programs
  FOR SELECT USING (true);

-- Only admins can manage mentorship programs
CREATE POLICY "Admins can manage mentorship programs" ON mentorship_programs
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Policies for mentorship_relationships
-- Users can view relationships they're part of
CREATE POLICY "Users can view their mentorship relationships" ON mentorship_relationships
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Mentees can create mentorship requests
CREATE POLICY "Mentees can create mentorship requests" ON mentorship_relationships
  FOR INSERT WITH CHECK (auth.uid() = mentee_id);

-- Users can update relationships they're part of
CREATE POLICY "Users can update their mentorship relationships" ON mentorship_relationships
  FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Policies for activity_logs
-- Only admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON activity_logs
  FOR SELECT USING (profile_id = auth.uid());

-- Only the system can insert activity logs
CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Policies for notifications
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (profile_id = auth.uid());

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (profile_id = auth.uid());

-- Only the system can insert notifications
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Functions and Triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for roles
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for event_attendees
CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON event_attendees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for job_listings
CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for job_applications
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for mentorship_programs
CREATE TRIGGER update_mentorship_programs_updated_at
  BEFORE UPDATE ON mentorship_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for mentorship_relationships
CREATE TRIGGER update_mentorship_relationships_updated_at
  BEFORE UPDATE ON mentorship_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default roles
INSERT INTO roles (name, description, permissions)
VALUES 
  ('admin', 'Administrator with full system access', '{"admin": true, "manage_users": true, "manage_content": true}'),
  ('user', 'Regular user with basic access', '{"view_content": true}'),
  ('alumni', 'Verified alumni with additional access', '{"view_content": true, "alumni_features": true}'),
  ('employer', 'Employer with job posting privileges', '{"view_content": true, "post_jobs": true}')
ON CONFLICT (name) DO NOTHING;

-- Function to assign admin role to a specific user
CREATE OR REPLACE FUNCTION assign_admin_role(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
  admin_user_id UUID;
  admin_role_id UUID;
BEGIN
  -- Get the user ID from the email
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
  
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Assign admin role to user if both IDs exist and the role isn't already assigned
  IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE profile_id = admin_user_id AND role_id = admin_role_id) THEN
      INSERT INTO user_roles (profile_id, role_id)
      VALUES (admin_user_id, admin_role_id);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
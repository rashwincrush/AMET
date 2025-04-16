-- Combined migration for Data Backup, Advanced Search, and Alumni Achievements features

-- ===============================
-- 1. Data Backup & Validation
-- ===============================

-- Create backups table to track backup metadata
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  filename TEXT NOT NULL,
  file_size BIGINT,
  tables TEXT[] NOT NULL,
  record_counts JSONB NOT NULL,
  status TEXT NOT NULL,
  validation_results JSONB,
  notes TEXT
);

-- Create backups bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'backups'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('backups', 'backups', FALSE);
  END IF;
END$$;

-- Add RLS policies for backups table
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Only super_admin and admin can access backups
CREATE POLICY "Admins can access backups"
  ON backups
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- ===============================
-- 2. Advanced Search Options
-- ===============================

-- Enable full text search on profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION profiles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector = 
     setweight(to_tsvector('english', coalesce(NEW.first_name, '')), 'A') ||
     setweight(to_tsvector('english', coalesce(NEW.last_name, '')), 'A') ||
     setweight(to_tsvector('english', coalesce(NEW.major, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.job_title, '')), 'B') ||
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

-- Create saved searches table
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

-- Update existing profiles with search vector
UPDATE profiles SET updated_at = NOW();

-- ===============================
-- 3. Alumni Achievements Showcase
-- ===============================

-- Create achievement categories enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievement_category') THEN
    CREATE TYPE achievement_category AS ENUM (
      'professional',
      'academic',
      'community',
      'award',
      'certification',
      'publication',
      'other'
    );
  END IF;
END$$;

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE,
  category achievement_category NOT NULL,
  organization TEXT,
  url TEXT,
  media_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievement-media bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'achievement-media'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('achievement-media', 'achievement-media', TRUE);
  END IF;
END$$;

-- Add RLS policies for achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Users can read all approved achievements
CREATE POLICY "Anyone can view approved achievements"
  ON achievements
  FOR SELECT
  USING (is_approved = TRUE);

-- Users can manage their own achievements
CREATE POLICY "Users can manage their own achievements"
  ON achievements
  FOR ALL
  USING (auth.uid() = user_id);

-- Admins can manage all achievements
CREATE POLICY "Admins can manage all achievements"
  ON achievements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Add storage policies for achievement media
CREATE POLICY "Users can upload their own achievement media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'achievement-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own achievement media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'achievement-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own achievement media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'achievement-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can read approved achievement media"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'achievement-media');

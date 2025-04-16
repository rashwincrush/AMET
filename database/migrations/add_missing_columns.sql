-- Migration to add missing columns to existing tables

-- Add industry column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Add achievements for marine ranks
CREATE TABLE IF NOT EXISTS marine_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rank TEXT CHECK (rank IN ('marine', 'captain', 'commodore', 'admiral', 'fleet_admiral', 'navigator')),
  description TEXT,
  awarded_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_attendees table with correct foreign key relationship
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('registered', 'attended', 'cancelled')) DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create RLS policies for marine_achievements
ALTER TABLE marine_achievements ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view marine achievements
CREATE POLICY "Anyone can view marine achievements" 
ON marine_achievements FOR SELECT 
USING (TRUE);

-- Allow users to manage their own marine achievements
CREATE POLICY "Users can manage their own marine achievements" 
ON marine_achievements FOR ALL 
TO authenticated 
USING (profile_id = auth.uid());

-- Create RLS policies for event_attendees
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view event attendees
CREATE POLICY "Anyone can view event attendees" 
ON event_attendees FOR SELECT 
USING (TRUE);

-- Allow users to register themselves for events
CREATE POLICY "Users can register themselves for events" 
ON event_attendees FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own event attendance
CREATE POLICY "Users can update their own event attendance" 
ON event_attendees FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid()); 
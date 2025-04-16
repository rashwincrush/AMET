-- Migration to add mentor_availability table

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

-- Enable Row Level Security on all tables
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

-- Create triggers to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
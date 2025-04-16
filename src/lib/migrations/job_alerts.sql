-- Job Alerts Schema
CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_type TEXT[],
  keywords TEXT[],
  location TEXT,
  min_salary INTEGER,
  max_salary INTEGER,
  notification_frequency TEXT CHECK (notification_frequency IN ('daily', 'weekly', 'instant')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on job_alerts
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for job_alerts
-- Users can view their own job alerts
CREATE POLICY "Users can view their own job alerts" ON job_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own job alerts
CREATE POLICY "Users can create their own job alerts" ON job_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own job alerts
CREATE POLICY "Users can update their own job alerts" ON job_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own job alerts
CREATE POLICY "Users can delete their own job alerts" ON job_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster job matching
CREATE INDEX job_alerts_user_id_idx ON job_alerts(user_id);
CREATE INDEX job_alerts_job_type_idx ON job_alerts USING GIN(job_type);
CREATE INDEX job_alerts_keywords_idx ON job_alerts USING GIN(keywords);
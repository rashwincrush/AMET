-- Create job_alert_notifications table to track sent job alerts
CREATE TABLE IF NOT EXISTS public.job_alert_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES public.job_alerts(id) ON DELETE CASCADE,
    match_score INTEGER,
    matched_criteria TEXT[],
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on the job_alert_notifications table
ALTER TABLE public.job_alert_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to view all notifications
CREATE POLICY "Admins can view all job alert notifications" 
ON public.job_alert_notifications FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Create policy to allow users to view their own notifications
CREATE POLICY "Users can view their own job alert notifications" 
ON public.job_alert_notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow the system to insert notifications
CREATE POLICY "System can insert job alert notifications" 
ON public.job_alert_notifications FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to update their own notifications (for tracking opens/clicks)
CREATE POLICY "Users can update their own job alert notifications" 
ON public.job_alert_notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS job_alert_notifications_user_id_idx ON public.job_alert_notifications (user_id);
CREATE INDEX IF NOT EXISTS job_alert_notifications_job_id_idx ON public.job_alert_notifications (job_id);
CREATE INDEX IF NOT EXISTS job_alert_notifications_alert_id_idx ON public.job_alert_notifications (alert_id);
CREATE INDEX IF NOT EXISTS job_alert_notifications_sent_at_idx ON public.job_alert_notifications (sent_at);

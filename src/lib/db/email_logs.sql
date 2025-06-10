-- Create email_logs table to track all sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email_type TEXT NOT NULL,
    email_data JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'sent',
    error_message TEXT
);

-- Enable RLS on the email_logs table
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to view all email logs
CREATE POLICY "Admins can view all email logs" 
ON public.email_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Create policy to allow users to view their own email logs
CREATE POLICY "Users can view their own email logs" 
ON public.email_logs FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow the system to insert email logs
CREATE POLICY "System can insert email logs" 
ON public.email_logs FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS email_logs_user_id_idx ON public.email_logs (user_id);
CREATE INDEX IF NOT EXISTS email_logs_email_type_idx ON public.email_logs (email_type);
CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx ON public.email_logs (sent_at);

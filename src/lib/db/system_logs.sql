-- Create system_logs table for tracking system activities and errors
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type TEXT NOT NULL,
    log_message TEXT NOT NULL,
    log_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    severity TEXT DEFAULT 'info'
);

-- Enable RLS on the system_logs table
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to view all system logs
CREATE POLICY "Admins can view all system logs" 
ON public.system_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Create policy to allow the system to insert logs
CREATE POLICY "System can insert system logs" 
ON public.system_logs FOR INSERT 
WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS system_logs_log_type_idx ON public.system_logs (log_type);
CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON public.system_logs (created_at);
CREATE INDEX IF NOT EXISTS system_logs_severity_idx ON public.system_logs (severity);

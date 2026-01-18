-- Create table for job alerts/preferences
CREATE TABLE public.job_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  job_types TEXT[] DEFAULT '{}',
  min_salary INTEGER,
  max_salary INTEGER,
  skills TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'daily', -- 'instant', 'daily', 'weekly'
  last_notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for external jobs cache
CREATE TABLE public.external_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL, -- 'adzuna', 'rapidapi', etc.
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT DEFAULT 'Full-time',
  salary TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  description TEXT,
  requirements TEXT,
  skills TEXT[] DEFAULT '{}',
  apply_link TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_fresher_eligible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for job alert notifications log
CREATE TABLE public.job_alert_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.job_alerts(id) ON DELETE CASCADE,
  job_ids TEXT[] NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' -- 'pending', 'sent', 'failed'
);

-- Create table for parsed resume skills
CREATE TABLE public.resume_parsed_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  extracted_skills TEXT[] DEFAULT '{}',
  extracted_experience TEXT,
  extracted_education TEXT,
  experience_years INTEGER DEFAULT 0,
  parsed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_parsed_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_alerts
CREATE POLICY "Users can view their own alerts" ON public.job_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own alerts" ON public.job_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.job_alerts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.job_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for external_jobs (public read)
CREATE POLICY "External jobs are viewable by everyone" ON public.external_jobs
  FOR SELECT USING (true);
CREATE POLICY "Service role can manage external jobs" ON public.external_jobs
  FOR ALL USING (true);

-- RLS policies for job_alert_notifications
CREATE POLICY "Users can view their notification logs" ON public.job_alert_notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.job_alerts WHERE id = alert_id AND user_id = auth.uid())
  );

-- RLS policies for resume_parsed_data
CREATE POLICY "Users can view their own parsed data" ON public.resume_parsed_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own parsed data" ON public.resume_parsed_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_job_alerts_updated_at
  BEFORE UPDATE ON public.job_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_jobs_updated_at
  BEFORE UPDATE ON public.external_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_external_jobs_fresher ON public.external_jobs (is_fresher_eligible);
CREATE INDEX idx_external_jobs_source ON public.external_jobs (source);
CREATE INDEX idx_job_alerts_user ON public.job_alerts (user_id);
CREATE INDEX idx_resume_parsed_user ON public.resume_parsed_data (user_id);
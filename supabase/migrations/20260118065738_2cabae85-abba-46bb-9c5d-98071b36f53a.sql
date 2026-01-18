-- Fix overly permissive RLS policy on external_jobs
DROP POLICY IF EXISTS "Service role can manage external jobs" ON public.external_jobs;

-- Only allow inserts/updates via service role (edge functions use service role key)
-- No user should be able to modify external jobs directly
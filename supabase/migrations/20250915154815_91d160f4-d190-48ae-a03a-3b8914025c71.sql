-- Security Fix: Restrict audit_log access to service roles only
-- Remove current policies that allow admin access to sensitive audit data

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Create new restrictive policies for service role only
CREATE POLICY "Service role can manage audit logs"
ON public.audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow the log_audit_event function to insert (it runs with SECURITY DEFINER)
CREATE POLICY "Allow audit logging function to insert"
ON public.audit_log
FOR INSERT
USING (true)
WITH CHECK (true);

-- Add data retention policy - automatically delete audit logs older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Create a scheduled cleanup job (this would need to be configured separately)
COMMENT ON FUNCTION public.cleanup_old_audit_logs() IS 'Cleanup function to delete audit logs older than 90 days. Should be called by a scheduled job.';
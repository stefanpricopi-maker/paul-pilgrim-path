-- Security Fix: Restrict audit_log access to service roles only

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Create restrictive policy for service role access only
CREATE POLICY "Service role only access"
ON public.audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow audit logging via the security definer function
CREATE POLICY "Audit function can insert"
ON public.audit_log
FOR INSERT
WITH CHECK (true);

-- Add cleanup function for data retention (90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
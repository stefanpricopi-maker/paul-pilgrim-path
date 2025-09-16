-- Security Enhancements - Part 3: Rate Limiting and Audit Logging

-- 1. Enhanced rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- More restrictive rate limiting for admin operations
  SELECT COUNT(*) INTO v_count
  FROM rate_limits
  WHERE user_id = auth.uid()
  AND action_type = 'admin_operation'
  AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Allow only 5 admin operations per minute
  IF v_count >= 5 THEN
    RETURN false;
  END IF;
  
  -- Record this admin action
  INSERT INTO rate_limits (user_id, action_type)
  VALUES (auth.uid(), 'admin_operation');
  
  RETURN true;
END;
$$;

-- 2. Add audit logging for admin operations (trigger function)
CREATE OR REPLACE FUNCTION public.log_admin_operation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when admin status is changed
  IF TG_OP = 'UPDATE' AND OLD.is_admin != NEW.is_admin THEN
    INSERT INTO audit_log (
      user_id,
      action_type,
      action_category,
      target_type,
      target_id,
      description,
      details
    ) VALUES (
      auth.uid(),
      'admin_status_change',
      'admin',
      'profile',
      NEW.id::text,
      CASE 
        WHEN NEW.is_admin THEN 'Admin privileges granted'
        ELSE 'Admin privileges revoked'
      END,
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_admin_status', OLD.is_admin,
        'new_admin_status', NEW.is_admin
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for admin operation logging
DROP TRIGGER IF EXISTS audit_admin_operations ON public.profiles;
CREATE TRIGGER audit_admin_operations
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_operation();
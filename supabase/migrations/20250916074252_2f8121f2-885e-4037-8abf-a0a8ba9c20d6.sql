-- Fix Critical RLS Recursion Issue and Enhance Privacy Protection

-- 1. Create a security definer function to safely check user roles without circular references
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false)
  FROM public.profiles 
  WHERE id = user_id;
$$;

-- 2. Create a function to check if current user is admin (non-recursive)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false)
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- 3. Drop existing problematic RLS policies on profiles
DROP POLICY IF EXISTS "Admins can manage admin status" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "read own profile" ON public.profiles;

-- 4. Create new RLS policies using security definer functions
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile (non-admin fields)"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND 
  -- Prevent users from changing their own admin status
  (OLD.is_admin = NEW.is_admin OR public.is_current_user_admin())
);

CREATE POLICY "Admins can read all profiles"
ON public.profiles  
FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- 5. Update existing functions to use proper search_path for security hardening
CREATE OR REPLACE FUNCTION public.get_profile_admin_status(user_id uuid)
RETURNS TABLE(is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.is_admin
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$;

-- 6. Enhanced rate limiting for sensitive operations
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

-- 7. Restrict player data access to game members only
DROP POLICY IF EXISTS "Allow reading players in same game" ON public.players;

CREATE POLICY "Game members can read players in same game"
ON public.players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM game_members gm1
    JOIN game_members gm2 ON gm1.game_id = gm2.game_id
    WHERE gm1.user_id = auth.uid() 
    AND gm2.user_id = players.user_id
    AND gm1.game_id = players.game_id
  )
);

-- 8. Add audit logging for admin operations
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
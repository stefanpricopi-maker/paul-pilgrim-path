-- Create a function to make the current user an admin (for initial setup)
CREATE OR REPLACE FUNCTION public.make_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Insert or update the current user as admin
  INSERT INTO public.profiles (id, is_admin)
  VALUES (auth.uid(), true)
  ON CONFLICT (id) 
  DO UPDATE SET is_admin = true;
  
  RETURN true;
END;
$$;

-- Create a function to check current user admin status
CREATE OR REPLACE FUNCTION public.check_my_admin_status()
RETURNS TABLE(user_id uuid, is_admin boolean, profile_exists boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    COALESCE(p.is_admin, false) as is_admin,
    (p.id IS NOT NULL) as profile_exists
  FROM (SELECT auth.uid() as uid) u
  LEFT JOIN public.profiles p ON p.id = u.uid;
END;
$$;
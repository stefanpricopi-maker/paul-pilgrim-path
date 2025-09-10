-- Security Fix 1: Secure database functions with proper search_path
-- Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Fix ensure_admin function  
DROP FUNCTION IF EXISTS public.ensure_admin(uuid);
CREATE OR REPLACE FUNCTION public.ensure_admin(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into profiles (id, is_admin)
  values (user_id, true)
  on conflict (id) 
  do update set is_admin = true;
end;
$$;

-- Fix debug_admin_status function
DROP FUNCTION IF EXISTS public.debug_admin_status(uuid);
CREATE OR REPLACE FUNCTION public.debug_admin_status(uid uuid)
RETURNS TABLE(found boolean, profile_id uuid, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare r record;
begin
  select id, is_admin into r
  from public.profiles
  where id = uid;

  if not found then
    return query select false, null::uuid, null::boolean;
  end if;

  return query select true, r.id, r.is_admin;
end;
$$;

-- Security Fix 2: Restrict cleanup_config and cleanup_log access to admins only
DROP POLICY IF EXISTS "Allow reading cleanup config" ON public.cleanup_config;
DROP POLICY IF EXISTS "Allow reading cleanup logs" ON public.cleanup_log;

CREATE POLICY "Admin only cleanup config access" 
ON public.cleanup_config 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

CREATE POLICY "Admin only cleanup log access" 
ON public.cleanup_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Security Fix 3: Restrict game_settings access to authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to read game settings" ON public.game_settings;

CREATE POLICY "Authenticated users can read game settings" 
ON public.game_settings 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Security Fix 4: Add proper RLS policies for profiles table
-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

-- Allow admins to read all profiles (for admin panel)
CREATE POLICY "Admins can read all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Allow admins to update admin status
CREATE POLICY "Admins can manage admin status" 
ON public.profiles 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Security Fix 5: Create secure function for fetching players for admin
CREATE OR REPLACE FUNCTION public.get_players_for_admin()
RETURNS TABLE(
  id uuid,
  username text,
  is_admin boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT p.id, p.username, p.is_admin, p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;
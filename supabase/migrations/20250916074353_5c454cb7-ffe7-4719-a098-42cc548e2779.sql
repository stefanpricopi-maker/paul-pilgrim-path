-- Fix Critical RLS Recursion Issue - Part 2: Update RLS Policies (Corrected)

-- 1. Drop existing problematic RLS policies on profiles
DROP POLICY IF EXISTS "Admins can manage admin status" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "read own profile" ON public.profiles;

-- 2. Create new RLS policies using security definer functions
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can read all profiles"
ON public.profiles  
FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());
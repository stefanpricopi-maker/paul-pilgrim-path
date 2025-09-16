-- Fix Critical RLS Recursion Issue - Part 1: Security Definer Functions

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
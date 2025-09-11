-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Allow admin to update games" ON public.games;

-- Add RLS policy to allow admins to update games using secure function
CREATE POLICY "Allow admin to update games" 
ON public.games 
FOR UPDATE 
USING (
  COALESCE(
    (SELECT (get_profile_admin_status(auth.uid()))[1].is_admin), 
    false
  )
) 
WITH CHECK (
  COALESCE(
    (SELECT (get_profile_admin_status(auth.uid()))[1].is_admin), 
    false
  )
);
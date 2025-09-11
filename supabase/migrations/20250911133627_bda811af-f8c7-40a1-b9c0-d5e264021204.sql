-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Allow admin to update games" ON public.games;

-- Add RLS policy to allow admins to update games using secure function
CREATE POLICY "Allow admin to update games" 
ON public.games 
FOR UPDATE 
USING (
  COALESCE(
    (SELECT is_admin FROM get_profile_admin_status(auth.uid()) LIMIT 1), 
    false
  )
) 
WITH CHECK (
  COALESCE(
    (SELECT is_admin FROM get_profile_admin_status(auth.uid()) LIMIT 1), 
    false
  )
);
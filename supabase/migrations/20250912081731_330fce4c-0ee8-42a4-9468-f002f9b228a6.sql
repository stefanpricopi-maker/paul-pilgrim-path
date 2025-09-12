-- Fix infinite recursion in tiles RLS policy by using secure admin function
DROP POLICY IF EXISTS "Admins can manage tiles" ON public.tiles;

-- Create new policy using the secure admin status function
CREATE POLICY "Admins can manage tiles" 
ON public.tiles 
FOR ALL 
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
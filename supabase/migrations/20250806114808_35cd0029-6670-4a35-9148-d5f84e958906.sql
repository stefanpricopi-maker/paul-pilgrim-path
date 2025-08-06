-- Update RLS policies to allow players to see other players in the same game
-- Keep the existing policy for reading players in same game, but update the others

-- Drop the restrictive policies that only allow users to see their own data
DROP POLICY IF EXISTS "Allow players to read their own data" ON public.players;

-- The "Allow reading players in same game" policy should be sufficient for viewing all players in a game
-- But let's make sure it works properly by recreating it with better logic

DROP POLICY IF EXISTS "Allow reading players in same game" ON public.players;

-- Create a comprehensive policy for reading players in the same game
CREATE POLICY "Allow reading players in same game" 
ON public.players 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.game_members gm1 
    JOIN public.game_members gm2 ON gm1.game_id = gm2.game_id 
    WHERE gm1.user_id = auth.uid() 
    AND gm2.user_id = players.user_id 
    AND gm1.game_id = players.game_id
  )
);
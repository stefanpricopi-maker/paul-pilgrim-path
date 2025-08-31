-- Fix game_log RLS policy to allow players to see all logs for games they're members of
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow players to read their own logs" ON game_log;

-- Create a new policy that allows players to read all logs for games they are members of
CREATE POLICY "Allow players to read game logs for their games"
ON game_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM game_members 
    WHERE game_members.user_id = auth.uid() 
    AND game_members.game_id = game_log.game_id
  )
);
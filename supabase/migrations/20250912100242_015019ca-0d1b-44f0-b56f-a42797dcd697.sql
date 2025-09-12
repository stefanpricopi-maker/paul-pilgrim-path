-- Clean security hardening migration - fix RLS policies without duplicates

-- Update games RLS policies to be more restrictive
DROP POLICY IF EXISTS "Allow reading public games" ON public.games;
DROP POLICY IF EXISTS "Allow user to create a game" ON public.games;

-- Only allow game members to read games
CREATE POLICY "Game members can read games" 
ON public.games 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM game_members 
    WHERE game_members.game_id = games.id 
    AND game_members.user_id = auth.uid()
  )
);

-- Restrict game creation to authenticated users with rate limiting
CREATE POLICY "Authenticated users can create games with rate limit" 
ON public.games 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' 
  AND check_rate_limit('create_game', NULL, 5, '1 hour')
);

-- Update players RLS policies to be more restrictive
DROP POLICY IF EXISTS "Allow reading players in same game" ON public.players;

-- More secure player reading policy
CREATE POLICY "Game members can read players in their games" 
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

-- Restrict direct player updates - force use of secure functions
DROP POLICY IF EXISTS "Allow players to update their own data" ON public.players;

CREATE POLICY "Players can only update non-critical fields" 
ON public.players 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND OLD.coins = NEW.coins -- Prevent direct coin manipulation
  AND OLD.position = NEW.position -- Prevent direct position manipulation
  AND OLD.in_jail = NEW.in_jail -- Prevent direct jail manipulation
);

-- Update tiles RLS to prevent direct manipulation
DROP POLICY IF EXISTS "Allow players to update their owned tiles" ON public.tiles;

-- Tiles can only be read, not directly updated by clients
CREATE POLICY "Game members can read tiles" 
ON public.tiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM game_members 
    WHERE game_members.user_id = auth.uid() 
    AND game_members.game_id = tiles.game_id
  )
);

-- Only secure functions can update tiles
CREATE POLICY "Only secure functions can update tiles" 
ON public.tiles 
FOR UPDATE 
USING (false) -- No direct updates allowed
WITH CHECK (false);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_time 
ON public.rate_limits (user_id, action_type, created_at);

CREATE INDEX IF NOT EXISTS idx_game_members_user_game 
ON public.game_members (user_id, game_id);
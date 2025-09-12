-- Continue security hardening: Fix remaining RLS policies and add rate limiting

-- Create rate_limits table for preventing abuse
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  game_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policy for rate_limits - users can only see their own
CREATE POLICY "Users can only see their own rate limits" 
ON public.rate_limits 
FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action_type TEXT,
  p_game_id UUID DEFAULT NULL,
  p_limit_count INTEGER DEFAULT 10,
  p_time_window INTERVAL DEFAULT '1 minute'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count recent actions
  SELECT COUNT(*) INTO v_count
  FROM rate_limits
  WHERE user_id = auth.uid()
  AND action_type = p_action_type
  AND (p_game_id IS NULL OR game_id = p_game_id)
  AND created_at > NOW() - p_time_window;
  
  -- Check if limit exceeded
  IF v_count >= p_limit_count THEN
    RETURN false;
  END IF;
  
  -- Record this action
  INSERT INTO rate_limits (user_id, action_type, game_id)
  VALUES (auth.uid(), p_action_type, p_game_id);
  
  RETURN true;
END;
$$;

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

-- Clean up old rate limit entries (optional cleanup function)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < NOW() - INTERVAL '1 day';
END;
$$;
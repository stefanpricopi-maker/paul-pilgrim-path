-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cleanup configuration table
CREATE TABLE IF NOT EXISTS public.cleanup_config (
  id SERIAL PRIMARY KEY,
  setting_name TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default cleanup settings
INSERT INTO public.cleanup_config (setting_name, setting_value, description) VALUES
  ('cleanup_waiting_games_hours', '24', 'Delete waiting games older than this many hours'),
  ('cleanup_finished_games_hours', '168', 'Delete finished games older than this many hours (7 days)'),
  ('cleanup_enabled', 'true', 'Enable/disable automatic cleanup'),
  ('cleanup_interval_minutes', '360', 'How often to run cleanup in minutes (6 hours)')
ON CONFLICT (setting_name) DO NOTHING;

-- Add foreign key constraints with CASCADE deletion if they don't exist
DO $$ 
BEGIN
  -- Add foreign key for tiles -> games
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tiles_game_id_fkey' AND table_name = 'tiles'
  ) THEN
    ALTER TABLE public.tiles 
    ADD CONSTRAINT tiles_game_id_fkey 
    FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for players -> games
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'players_game_id_fkey' AND table_name = 'players'
  ) THEN
    ALTER TABLE public.players 
    ADD CONSTRAINT players_game_id_fkey 
    FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for game_members -> games
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_members_game_id_fkey' AND table_name = 'game_members'
  ) THEN
    ALTER TABLE public.game_members 
    ADD CONSTRAINT game_members_game_id_fkey 
    FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for game_log -> games
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_log_game_id_fkey' AND table_name = 'game_log'
  ) THEN
    ALTER TABLE public.game_log 
    ADD CONSTRAINT game_log_game_id_fkey 
    FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create cleanup log table
CREATE TABLE IF NOT EXISTS public.cleanup_log (
  id SERIAL PRIMARY KEY,
  cleanup_type TEXT NOT NULL,
  games_deleted INTEGER DEFAULT 0,
  related_records_deleted INTEGER DEFAULT 0,
  cleanup_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cleanup_completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- Create the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_games()
RETURNS TABLE(
  games_deleted INTEGER,
  tiles_deleted INTEGER,
  players_deleted INTEGER,
  members_deleted INTEGER,
  logs_deleted INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  waiting_hours INTEGER;
  finished_hours INTEGER;
  cleanup_enabled BOOLEAN;
  deleted_games INTEGER := 0;
  deleted_tiles INTEGER := 0;
  deleted_players INTEGER := 0;
  deleted_members INTEGER := 0;
  deleted_logs INTEGER := 0;
  log_id INTEGER;
BEGIN
  -- Get cleanup configuration
  SELECT setting_value::INTEGER INTO waiting_hours 
  FROM public.cleanup_config WHERE setting_name = 'cleanup_waiting_games_hours';
  
  SELECT setting_value::INTEGER INTO finished_hours 
  FROM public.cleanup_config WHERE setting_name = 'cleanup_finished_games_hours';
  
  SELECT setting_value::BOOLEAN INTO cleanup_enabled 
  FROM public.cleanup_config WHERE setting_name = 'cleanup_enabled';

  -- Exit if cleanup is disabled
  IF NOT cleanup_enabled THEN
    RETURN QUERY SELECT 0, 0, 0, 0, 0;
    RETURN;
  END IF;

  -- Start cleanup log
  INSERT INTO public.cleanup_log (cleanup_type, cleanup_started_at)
  VALUES ('automatic', NOW())
  RETURNING id INTO log_id;

  -- Count records before deletion for logging
  SELECT COUNT(*) INTO deleted_tiles
  FROM public.tiles t
  JOIN public.games g ON t.game_id = g.id
  WHERE (g.status = 'waiting' AND g.created_at < NOW() - INTERVAL '1 hour' * waiting_hours)
     OR (g.status IN ('finished', 'cancelled') AND g.created_at < NOW() - INTERVAL '1 hour' * finished_hours);

  SELECT COUNT(*) INTO deleted_players
  FROM public.players p
  JOIN public.games g ON p.game_id = g.id
  WHERE (g.status = 'waiting' AND g.created_at < NOW() - INTERVAL '1 hour' * waiting_hours)
     OR (g.status IN ('finished', 'cancelled') AND g.created_at < NOW() - INTERVAL '1 hour' * finished_hours);

  SELECT COUNT(*) INTO deleted_members
  FROM public.game_members gm
  JOIN public.games g ON gm.game_id = g.id
  WHERE (g.status = 'waiting' AND g.created_at < NOW() - INTERVAL '1 hour' * waiting_hours)
     OR (g.status IN ('finished', 'cancelled') AND g.created_at < NOW() - INTERVAL '1 hour' * finished_hours);

  SELECT COUNT(*) INTO deleted_logs
  FROM public.game_log gl
  JOIN public.games g ON gl.game_id = g.id
  WHERE (g.status = 'waiting' AND g.created_at < NOW() - INTERVAL '1 hour' * waiting_hours)
     OR (g.status IN ('finished', 'cancelled') AND g.created_at < NOW() - INTERVAL '1 hour' * finished_hours);

  -- Delete old games (CASCADE will handle related records)
  DELETE FROM public.games 
  WHERE (status = 'waiting' AND created_at < NOW() - INTERVAL '1 hour' * waiting_hours)
     OR (status IN ('finished', 'cancelled') AND created_at < NOW() - INTERVAL '1 hour' * finished_hours);
  
  GET DIAGNOSTICS deleted_games = ROW_COUNT;

  -- Update cleanup log
  UPDATE public.cleanup_log 
  SET 
    games_deleted = deleted_games,
    related_records_deleted = deleted_tiles + deleted_players + deleted_members + deleted_logs,
    cleanup_completed_at = NOW(),
    success = TRUE
  WHERE id = log_id;

  -- Return results
  RETURN QUERY SELECT deleted_games, deleted_tiles, deleted_players, deleted_members, deleted_logs;
END;
$$;

-- Schedule the cleanup job to run every 6 hours
SELECT cron.schedule(
  'game-cleanup-job',
  '0 */6 * * *', -- Every 6 hours at minute 0
  $$SELECT public.cleanup_old_games();$$
);

-- Create RLS policies for cleanup tables
ALTER TABLE public.cleanup_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cleanup config and logs
CREATE POLICY "Allow reading cleanup config" ON public.cleanup_config
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow reading cleanup logs" ON public.cleanup_log
FOR SELECT TO authenticated USING (true);

-- Allow service role to manage cleanup
CREATE POLICY "Service can manage cleanup config" ON public.cleanup_config
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage cleanup logs" ON public.cleanup_log
FOR ALL USING (auth.role() = 'service_role');
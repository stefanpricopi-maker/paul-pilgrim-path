-- Fix the search path issue for the cleanup function
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
SET search_path TO 'public'
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
-- Ensure host_id is automatically set to the creator for new games
CREATE OR REPLACE FUNCTION public.set_game_host_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.host_id IS NULL THEN
    NEW.host_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to set host_id on game creation
DROP TRIGGER IF EXISTS trg_set_game_host ON public.games;
CREATE TRIGGER trg_set_game_host
BEFORE INSERT ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.set_game_host_id();

-- Create trigger to auto-create tiles for new games if not already present
DROP TRIGGER IF EXISTS trg_auto_create_game_tiles ON public.games;
CREATE TRIGGER trg_auto_create_game_tiles
AFTER INSERT ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_game_tiles();

-- Backfill host_id for existing games using game_members with role 'host'
UPDATE public.games g
SET host_id = gm.user_id
FROM public.game_members gm
WHERE g.id = gm.game_id
  AND gm.role = 'host'
  AND g.host_id IS NULL;

-- Optional: Improve realtime change payloads (safe even if already set)
ALTER TABLE public.players REPLICA IDENTITY FULL;
ALTER TABLE public.game_members REPLICA IDENTITY FULL;
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.tiles REPLICA IDENTITY FULL;
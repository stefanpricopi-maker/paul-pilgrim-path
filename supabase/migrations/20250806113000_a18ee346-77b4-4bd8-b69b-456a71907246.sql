-- Drop and recreate the function with explicit schema references
DROP FUNCTION IF EXISTS copy_template_tiles(uuid);

-- Function to copy template tiles for a new game with explicit schema references
CREATE OR REPLACE FUNCTION public.copy_template_tiles(target_game_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.tiles (name, type, tile_index, game_id, owner_id, building_type)
  SELECT name, type, tile_index, target_game_id, null, null
  FROM public.tiles 
  WHERE game_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Drop and recreate the trigger function with explicit schema references  
DROP FUNCTION IF EXISTS auto_create_game_tiles();

CREATE OR REPLACE FUNCTION public.auto_create_game_tiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create tiles for new games in waiting status
  IF NEW.status = 'waiting' THEN
    PERFORM public.copy_template_tiles(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_auto_create_game_tiles ON public.games;

CREATE TRIGGER trigger_auto_create_game_tiles
  AFTER INSERT ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_game_tiles();
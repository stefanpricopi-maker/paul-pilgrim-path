-- Function to copy template tiles for a new game
CREATE OR REPLACE FUNCTION copy_template_tiles(target_game_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.tiles (name, type, tile_index, game_id, owner_id, building_type)
  SELECT name, type, tile_index, target_game_id, null, null
  FROM public.tiles 
  WHERE game_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create tiles when a game is created
CREATE OR REPLACE FUNCTION auto_create_game_tiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create tiles for new games in waiting status
  IF NEW.status = 'waiting' THEN
    PERFORM copy_template_tiles(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_create_game_tiles
  AFTER INSERT ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_game_tiles();
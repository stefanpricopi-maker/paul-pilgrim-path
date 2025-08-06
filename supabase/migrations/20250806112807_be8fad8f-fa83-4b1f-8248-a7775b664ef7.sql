-- Fix search path security for the functions
ALTER FUNCTION copy_template_tiles(uuid) SET search_path = '';
ALTER FUNCTION auto_create_game_tiles() SET search_path = '';
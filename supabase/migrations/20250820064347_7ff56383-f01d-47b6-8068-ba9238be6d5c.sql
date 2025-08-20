-- Fix security warning by setting search_path
CREATE OR REPLACE FUNCTION public.set_game_host_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.host_id IS NULL THEN
    NEW.host_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Add template tiles for game board (these will be copied for each new game)
INSERT INTO public.tiles (name, type, tile_index, game_id, owner_id, building_type) VALUES
-- START tile
('Antiochia', 'start', 0, null, null, null),
-- Properties around the board
('Bethlehem', 'city', 1, null, null, null),
('Community Chest', 'community', 2, null, null, null),
('Nazareth', 'city', 3, null, null, null),
('Income Tax', 'tax', 4, null, null, null),
('Jerusalem Port', 'port', 5, null, null, null),
('Capernaum', 'city', 6, null, null, null),
('Chance', 'chance', 7, null, null, null),
('Tiberias', 'city', 8, null, null, null),
('Magdala', 'city', 9, null, null, null),
-- PRISON tile
('Temniţa', 'prison', 10, null, null, null),
('Jericho', 'city', 11, null, null, null),
('Public Treasury', 'utility', 12, null, null, null),
('Bethsaida', 'city', 13, null, null, null),
('Gaza', 'city', 14, null, null, null),
('Damascus Port', 'port', 15, null, null, null),
('Caesarea', 'city', 16, null, null, null),
('Community Chest', 'community', 17, null, null, null),
('Samaria', 'city', 18, null, null, null),
('Lydda', 'city', 19, null, null, null),
-- FREE PARKING / CORT
('Cort', 'special', 20, null, null, null),
('Ephesus', 'city', 21, null, null, null),
('Chance', 'chance', 22, null, null, null),
('Smyrna', 'city', 23, null, null, null),
('Pergamon', 'city', 24, null, null, null),
('Corinth Port', 'port', 25, null, null, null),
('Thyatira', 'city', 26, null, null, null),
('Sardis', 'city', 27, null, null, null),
('Water Supply', 'utility', 28, null, null, null),
('Philadelphia', 'city', 29, null, null, null),
-- GO TO PRISON / SABAT
('Sabat', 'go-to-prison', 30, null, null, null),
('Laodicea', 'city', 31, null, null, null),
('Colossae', 'city', 32, null, null, null),
('Community Chest', 'community', 33, null, null, null),
('Hierapolis', 'city', 34, null, null, null),
('Athens Port', 'port', 35, null, null, null),
('Chance', 'chance', 36, null, null, null),
('Thessalonica', 'city', 37, null, null, null),
('Luxury Tax', 'sacrifice', 38, null, null, null),
('Rome', 'city', 39, null, null, null)
ON CONFLICT (tile_index, game_id) DO NOTHING;
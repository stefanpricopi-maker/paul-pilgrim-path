-- First, clear any existing template tiles
DELETE FROM public.tiles WHERE game_id IS NULL;

-- Insert all tile data from locations.ts
INSERT INTO public.tiles (name, type, tile_index, game_id, owner_id, building_type) VALUES
-- Position 0: ANTIOCHIA (starting corner)
('ANTIOCHIA', 'special', 0, NULL, NULL, NULL),

-- Bottom row (positions 1-9)
('SALAMINA', 'city', 1, NULL, NULL, NULL),
('COMUNITATE', 'community-chest', 2, NULL, NULL, NULL),
('PAFOS', 'city', 3, NULL, NULL, NULL),
('PERGA', 'city', 4, NULL, NULL, NULL),
('PORT', 'port', 5, NULL, NULL, NULL),
('ICONIA', 'city', 6, NULL, NULL, NULL),
('HAR', 'chance', 7, NULL, NULL, NULL),
('LISTRA', 'city', 8, NULL, NULL, NULL),
('DERBE', 'city', 9, NULL, NULL, NULL),

-- Position 10: PRISON (corner)
('PRISON', 'prison', 10, NULL, NULL, NULL),

-- Left column (positions 11-19)
('ANTIOCHIA PISIDIEI', 'city', 11, NULL, NULL, NULL),
('CORT', 'special', 12, NULL, NULL, NULL),
('TARS', 'city', 13, NULL, NULL, NULL),
('TROAS', 'city', 14, NULL, NULL, NULL),
('PORT', 'port', 15, NULL, NULL, NULL),
('FILIPI', 'city', 16, NULL, NULL, NULL),
('COMUNITATE', 'community-chest', 17, NULL, NULL, NULL),
('TESALONIC', 'city', 18, NULL, NULL, NULL),
('BEREEA', 'city', 19, NULL, NULL, NULL),

-- Position 20: SABAT (corner)
('SABAT', 'special', 20, NULL, NULL, NULL),

-- Top row (positions 21-29)
('EFES', 'city', 21, NULL, NULL, NULL),
('HAR', 'chance', 22, NULL, NULL, NULL),
('ATENA', 'city', 23, NULL, NULL, NULL),
('CORINT', 'city', 24, NULL, NULL, NULL),
('PORT', 'port', 25, NULL, NULL, NULL),
('AMFIPOLIS', 'city', 26, NULL, NULL, NULL),
('APOLONIA', 'city', 27, NULL, NULL, NULL),
('JERTFA', 'sacrifice', 28, NULL, NULL, NULL),
('MILET', 'city', 29, NULL, NULL, NULL),

-- Position 30: GO TO PRISON (corner)
('GO TO PRISON', 'go-to-prison', 30, NULL, NULL, NULL),

-- Right column (positions 31-39)
('RODOS', 'city', 31, NULL, NULL, NULL),
('SIDON', 'city', 32, NULL, NULL, NULL),
('COMUNITATE', 'community-chest', 33, NULL, NULL, NULL),
('MALTA', 'city', 34, NULL, NULL, NULL),
('PORT', 'port', 35, NULL, NULL, NULL),
('IERUSALIM', 'city', 36, NULL, NULL, NULL),
('HAR', 'chance', 37, NULL, NULL, NULL),
('ROMA', 'city', 38, NULL, NULL, NULL),
('JERTFA', 'sacrifice', 39, NULL, NULL, NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tiles_game_id ON public.tiles(game_id);
CREATE INDEX IF NOT EXISTS idx_tiles_tile_index ON public.tiles(tile_index);
CREATE INDEX IF NOT EXISTS idx_tiles_template ON public.tiles(game_id) WHERE game_id IS NULL;
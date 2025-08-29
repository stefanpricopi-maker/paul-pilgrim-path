-- Create property_buildings table to track building counts on each tile
CREATE TABLE public.property_buildings (
  id SERIAL PRIMARY KEY,
  tile_id INTEGER NOT NULL REFERENCES public.tiles(id) ON DELETE CASCADE,
  building_type TEXT NOT NULL CHECK (building_type IN ('church', 'synagogue')),
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tile_id, building_type)
);

-- Enable RLS on property_buildings table
ALTER TABLE public.property_buildings ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading building data for game members
CREATE POLICY "Allow members to read property buildings" 
ON public.property_buildings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tiles t 
    JOIN public.game_members gm ON gm.game_id = t.game_id 
    WHERE t.id = property_buildings.tile_id 
    AND gm.user_id = auth.uid()
  )
);

-- Policy to allow updating building data for property owners
CREATE POLICY "Allow property owners to manage buildings" 
ON public.property_buildings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.tiles t 
    JOIN public.players p ON p.id = t.owner_id 
    WHERE t.id = property_buildings.tile_id 
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tiles t 
    JOIN public.players p ON p.id = t.owner_id 
    WHERE t.id = property_buildings.tile_id 
    AND p.user_id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_property_buildings_updated_at
BEFORE UPDATE ON public.property_buildings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add function to increment building count
CREATE OR REPLACE FUNCTION public.increment_building_count(
  p_tile_id INTEGER,
  p_building_type TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.property_buildings (tile_id, building_type, count)
  VALUES (p_tile_id, p_building_type, 1)
  ON CONFLICT (tile_id, building_type)
  DO UPDATE SET 
    count = property_buildings.count + 1,
    updated_at = NOW();
END;
$$;
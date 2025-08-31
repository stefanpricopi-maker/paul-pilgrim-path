-- Enable RLS on game_settings table
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read game settings
CREATE POLICY "Allow authenticated users to read game settings"
ON public.game_settings
FOR SELECT
TO authenticated
USING (true);

-- Only allow service role to modify game settings for security
CREATE POLICY "Allow service role to manage game settings"
ON public.game_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
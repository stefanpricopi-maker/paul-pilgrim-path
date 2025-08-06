-- Add user_id column to players table to properly link players to users
ALTER TABLE public.players ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing RLS policies that use id = auth.uid()
DROP POLICY IF EXISTS "Allow users to insert their own player row" ON public.players;
DROP POLICY IF EXISTS "Allow players to delete their own row" ON public.players;
DROP POLICY IF EXISTS "Allow players to read their own data" ON public.players;
DROP POLICY IF EXISTS "Allow players to update their own data" ON public.players;
DROP POLICY IF EXISTS "Players can access their own rows" ON public.players;

-- Create new RLS policies using user_id
CREATE POLICY "Allow users to insert their own player row" 
ON public.players 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow players to delete their own row" 
ON public.players 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow players to read their own data" 
ON public.players 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow players to update their own data" 
ON public.players 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
-- Ensure RLS is enabled and create policies so game members can write/read Journey Log
-- This allows any authenticated member of a game to insert and read logs for that specific game

-- Enable Row Level Security (safe if already enabled)
ALTER TABLE public.game_log ENABLE ROW LEVEL SECURITY;

-- Create policies idempotently
DO $$
BEGIN
  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'game_log' 
      AND policyname = 'Game members can read game logs'
  ) THEN
    CREATE POLICY "Game members can read game logs"
      ON public.game_log
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.game_members gm
          WHERE gm.game_id = game_log.game_id
            AND gm.user_id = auth.uid()
        )
      );
  END IF;

  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'game_log' 
      AND policyname = 'Game members can insert game logs'
  ) THEN
    CREATE POLICY "Game members can insert game logs"
      ON public.game_log
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.game_members gm
          WHERE gm.game_id = game_log.game_id
            AND gm.user_id = auth.uid()
        )
      );
  END IF;
END$$;

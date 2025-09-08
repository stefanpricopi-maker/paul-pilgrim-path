-- Fix Journey Log inserts being blocked by restrictive policy
-- Replace restrictive insert policy with a permissive, membership-based one

ALTER TABLE public.game_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop the overly restrictive insert policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'game_log' 
      AND policyname = 'Allow players to insert their own game logs'
  ) THEN
    DROP POLICY "Allow players to insert their own game logs" ON public.game_log;
  END IF;

  -- Create a permissive insert policy allowing any authenticated game member to insert logs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'game_log' 
      AND policyname = 'Game members can insert game logs'
  ) THEN
    CREATE POLICY "Game members can insert game logs"
      AS PERMISSIVE
      ON public.game_log
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.game_members gm
          WHERE gm.game_id = game_log.game_id
            AND gm.user_id = auth.uid()
        )
      );
  END IF;

  -- Ensure a matching SELECT policy exists (permissive membership-based)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'game_log' 
      AND policyname = 'Game members can read game logs'
  ) THEN
    CREATE POLICY "Game members can read game logs"
      AS PERMISSIVE
      ON public.game_log
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.game_members gm
          WHERE gm.game_id = game_log.game_id
            AND gm.user_id = auth.uid()
        )
      );
  END IF;
END$$;

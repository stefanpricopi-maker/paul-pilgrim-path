-- Add missing columns used by game logic
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS consecutive_doubles integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS skip_next_turn boolean NOT NULL DEFAULT false;
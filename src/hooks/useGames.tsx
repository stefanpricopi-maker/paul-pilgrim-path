// src/hooks/useGames.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/database';

export function useGames(options: { includeFinished?: boolean } = {}) {
  const includeFinished = options.includeFinished ?? true;
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    setLoading(true);
    let query = supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeFinished) {
      query = query.neq('status', 'finished');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } else {
      setGames(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, [includeFinished]);

  return { games, loading, refresh: fetchGames };
}

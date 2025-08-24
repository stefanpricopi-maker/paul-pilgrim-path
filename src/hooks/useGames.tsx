// src/hooks/useGames.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/database';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
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
  }, []);

  return { games, loading, refresh: fetchGames };
}

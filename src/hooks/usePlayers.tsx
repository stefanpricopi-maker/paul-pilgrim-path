// src/hooks/usePlayers.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Use the secure admin function instead of direct table access
        const { data, error } = await supabase.rpc('get_players_for_admin');

        if (error) {
          console.error("Error fetching players:", error);
          setError("Access denied: Admin privileges required");
          setPlayers([]);
        } else {
          setPlayers(data || []);
          setError(null);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Failed to fetch players");
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return { players, loading, error };
}

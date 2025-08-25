// src/hooks/usePlayers.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, is_admin, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching players:", error);
      } else {
        setPlayers(data || []);
      }
      setLoading(false);
    };

    fetchPlayers();
  }, []);

  return { players, loading };
}

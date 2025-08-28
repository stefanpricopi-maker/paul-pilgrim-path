import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/src/integrations/supabase/client"; // adjust path

type ReconnectStatus = "idle" | "checking" | "success" | "failed";

export function useReconnect() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ReconnectStatus>("idle");

  useEffect(() => {
    const reconnect = async () => {
      setStatus("checking");

      try {
        const sessionData = localStorage.getItem("game_session");
        if (!sessionData) {
          setStatus("failed");
          return;
        }

        const { game_id, user_id, member_id } = JSON.parse(sessionData);

        // 1. Check if game exists
        const { data: game, error: gameError } = await supabase
          .from("games")
          .select("*")
          .eq("id", game_id)
          .single();

        if (gameError || !game) {
          localStorage.removeItem("game_session");
          setStatus("failed");
          return;
        }

        // 2. Check if user is still part of the game
        const { data: member, error: memberError } = await supabase
          .from("game_members")
          .select("*")
          .eq("id", member_id)
          .eq("user_id", user_id)
          .eq("game_id", game_id)
          .single();

        if (memberError || !member) {
          localStorage.removeItem("game_session");
          setStatus("failed");
          return;
        }

        // Valid session → redirect to game
        setStatus("success");
        navigate(`/game/${game_id}`, { replace: true });
      } catch (err) {
        console.error("Reconnect error:", err);
        setStatus("failed");
      }
    };

    reconnect();
  }, [navigate]);

  return status;
}

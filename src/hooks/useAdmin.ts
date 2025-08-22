import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/utils"; // or wherever your supabase client is

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // No generic needed — types come from supabase client Database type
        const { data, error } = await supabase.rpc(
          "get_profile_admin_status",
          { user_id: user.id }
        );

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          // data is inferred as { is_admin: boolean }[] from Database type
          setIsAdmin(data?.[0]?.is_admin ?? false);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
}

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

type AdminStatus = { is_admin: boolean };
type AdminArgs = { user_id: string };

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
        const { data, error } = await supabase.rpc('get_profile_admin_status', { user_id: user.id });

        if (error) {
          console.error('RLS or permission error checking admin status:', error);
          // Fallback to false if RLS prevents access
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.[0]?.is_admin ?? false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Graceful degradation - assume non-admin on error
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
}
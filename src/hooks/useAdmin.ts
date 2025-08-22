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

      //const { data: session } = await supabase.auth.getSession();
      //console.log("Session check:", session);

      


      
      try {
        const { data, error } = await supabase.rpc('get_profile_admin_status',
            { 
              user_id: user.id 
            });

      //console.log('RPC data:', data);   // <-- Add this
     // console.log('RPC error:', error); // <-- Add this
      console.log('Current user:', user);
      console.log('useAdmin hook:', { isAdmin, loading });
  
      if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
                    setIsAdmin(data?.[0]?.is_admin ?? false);
                }

      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
}
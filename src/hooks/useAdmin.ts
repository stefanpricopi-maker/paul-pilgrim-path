import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('useAdmin: Starting admin check for user:', user?.id);
      
      if (!user) {
        console.log('useAdmin: No user, setting admin false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('useAdmin: Calling check_my_admin_status...');
        const { data, error } = await supabase.rpc('check_my_admin_status');

        console.log('useAdmin: Admin status response:', { data, error });

        if (error) {
          console.error('useAdmin: Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          const adminStatus = data?.[0]?.is_admin ?? false;
          console.log('useAdmin: Setting isAdmin to:', adminStatus);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('useAdmin: Catch error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        console.log('useAdmin: Setting loading false');
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]); // Changed dependency to user.id instead of user object

  console.log('useAdmin: Current state - isAdmin:', isAdmin, 'loading:', loading);
  
  return { isAdmin, loading };
}
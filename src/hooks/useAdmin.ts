import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('useAdmin: Auth loading:', authLoading, 'User:', user?.id);
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('useAdmin: Auth still loading, waiting...');
        return;
      }

      if (!user) {
        console.log('useAdmin: No user after auth loaded, setting admin false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('useAdmin: Calling check_my_admin_status for user:', user.id);
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
  }, [user?.id, authLoading]); // Added authLoading to dependencies

  console.log('useAdmin: Current state - isAdmin:', isAdmin, 'loading:', loading, 'authLoading:', authLoading);
  
  return { isAdmin, loading: loading || authLoading }; // Don't consider admin loaded until auth is loaded
}
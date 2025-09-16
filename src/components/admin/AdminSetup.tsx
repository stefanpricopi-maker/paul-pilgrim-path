import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, RefreshCw, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{ isAdmin: boolean; profileExists: boolean } | null>(null);

  const checkAdminStatus = async () => {
    setChecking(true);
    try {
      if (!user) {
        toast.error('Please log in first');
        return;
      }

      console.log('Checking admin status for user:', user.id);
      const { data, error } = await supabase.rpc('check_my_admin_status');
      
      if (error) {
        console.error('Error checking admin status:', error);
        toast.error(`Failed to check admin status: ${error.message}`);
        return;
      }

      console.log('Admin status response:', data);
      
      if (data && data[0]) {
        setAdminStatus({
          isAdmin: data[0].is_admin,
          profileExists: data[0].profile_exists
        });
        
        if (data[0].is_admin) {
          toast.success('You are already an admin! Please refresh the page.');
        }
      } else {
        toast.error('No data returned from admin status check');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to check admin status');
    } finally {
      setChecking(false);
    }
  };

  const makeAdmin = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast.error('Please log in first');
        setLoading(false);
        return;
      }

      console.log('Making user admin:', user.id);
      const { data, error } = await supabase.rpc('make_current_user_admin');
      
      if (error) {
        console.error('Error making user admin:', error);
        toast.error(`Failed to grant admin access: ${error.message}`);
        return;
      }

      console.log('Admin grant response:', data);
      toast.success('Admin access granted! Please refresh the page to see the Admin button.');
      
      // Recheck status
      await checkAdminStatus();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to grant admin access');
    } finally {
      setLoading(false);
    }
  };

  // Auto-check status when component mounts
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-md text-sm">
            <User className="w-4 h-4" />
            <span>Logged in as: {user.email}</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            You need admin privileges to access the admin dashboard.
          </p>
          
          <Button 
            onClick={checkAdminStatus} 
            variant="outline" 
            className="w-full"
            disabled={checking}
          >
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Admin Status
              </>
            )}
          </Button>

          {adminStatus && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p>Profile exists: {adminStatus.profileExists ? '✅' : '❌'}</p>
              <p>Is admin: {adminStatus.isAdmin ? '✅' : '❌'}</p>
            </div>
          )}

          {adminStatus && !adminStatus.isAdmin && (
            <Button 
              onClick={makeAdmin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Granting Access...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Grant Admin Access
                </>
              )}
            </Button>
          )}

          {adminStatus?.isAdmin && (
            <div className="text-center">
              <p className="text-green-600 font-medium">✅ You have admin access!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Refresh the page to access the admin dashboard.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-2 w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
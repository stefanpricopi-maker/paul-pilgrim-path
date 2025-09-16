import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{ isAdmin: boolean; profileExists: boolean } | null>(null);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('check_my_admin_status');
      
      if (error) {
        console.error('Error checking admin status:', error);
        toast.error('Failed to check admin status');
        return;
      }

      if (data && data[0]) {
        setAdminStatus({
          isAdmin: data[0].is_admin,
          profileExists: data[0].profile_exists
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to check admin status');
    }
  };

  const makeAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('make_current_user_admin');
      
      if (error) {
        console.error('Error making user admin:', error);
        toast.error('Failed to grant admin access');
        return;
      }

      toast.success('Admin access granted! Please refresh the page.');
      await checkAdminStatus();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to grant admin access');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-sm text-muted-foreground">
            You need admin privileges to access the admin dashboard.
          </p>
          
          <Button onClick={checkAdminStatus} variant="outline" className="w-full">
            Check Admin Status
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
                Refresh the page to see the admin button.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
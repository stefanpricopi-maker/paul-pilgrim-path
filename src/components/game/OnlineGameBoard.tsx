import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResumeOnlineGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resumePath, setResumePath] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('currentOnlineGameId');
    if (user && storedId) {
      setResumePath(`/online/${storedId}`);
    } else {
      setResumePath(null);
    }
  }, [user, location.pathname]);

  if (!resumePath) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-3 bg-card/95 shadow-ancient border-2 border-accent/30">
        <div className="flex items-center space-x-3">
          <div className="text-xl">🎲</div>
          <div>
            <p className="text-sm font-semibold">Online game in progress</p>
            <p className="text-xs text-muted-foreground">Resume where you left off</p>
          </div>
          <Button size="sm" onClick={() => navigate(resumePath)}>Return</Button>
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResumeOnlineGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasGame, setHasGame] = useState(false);

  useEffect(() => {
    // Only show on non-game root routes to avoid overlap
    const storedId = localStorage.getItem('currentOnlineGameId');
    setHasGame(!!user && !!storedId);
  }, [user, location.pathname]);

  if (!hasGame) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-3 bg-card/95 shadow-ancient border-2 border-accent/30">
        <div className="flex items-center space-x-3">
          <div className="text-xl">🎲</div>
          <div>
            <p className="text-sm font-semibold">Online game in progress</p>
            <p className="text-xs text-muted-foreground">Resume where you left off</p>
          </div>
          <Button size="sm" onClick={() => navigate('/')}>Return</Button>
        </div>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Wifi, Monitor, Settings } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';

interface GameModeSelectorProps {
  onSelectMode: (mode: 'online' | 'local') => void;
}



export default function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  console.log('Admin status:', isAdmin); // <-- see what value isAdmin has
  
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl font-bold text-primary ancient-text">
              Paul's Missionary Journeys
            </h1>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </Button>
            )}
          </div>
          <p className="text-lg text-muted-foreground">
            Choose your game mode to begin your journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Online Mode */}
          <Card className="bg-gradient-parchment border-2 border-accent/30 hover:border-accent/60 transition-colors cursor-pointer"
                onClick={() => onSelectMode('online')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                <Wifi className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-primary">Online Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Play with friends online. Create or join a room and play together in real-time.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Play with friends anywhere</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Real-time synchronization</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Up to 6 players</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Game progress saved automatically</span>
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Users className="w-4 h-4 mr-2" />
                Play Online
              </Button>
            </CardContent>
          </Card>

          {/* Local Mode */}
          <Card className="bg-gradient-parchment border-2 border-primary/30 hover:border-primary/60 transition-colors cursor-pointer"
                onClick={() => onSelectMode('local')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Local Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Play on the same device with friends and family. Perfect for gatherings!
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Same device multiplayer</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>No internet required</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Up to 6 players</span>
                </div>
              </div>
              <Button className="w-full" size="lg" variant="outline">
                <Monitor className="w-4 h-4 mr-2" />
                Play Locally
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
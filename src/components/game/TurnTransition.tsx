import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/game';
import { AIPlayer } from '@/types/ai';
import { ArrowRight, Crown, User, Bot } from 'lucide-react';

interface TurnTransitionProps {
  currentPlayer: Player | AIPlayer;
  nextPlayer?: Player | AIPlayer;
  isVisible: boolean;
  onComplete: () => void;
  speed?: number; // Animation speed multiplier
}

export default function TurnTransition({ 
  currentPlayer, 
  nextPlayer, 
  isVisible, 
  onComplete, 
  speed = 1 
}: TurnTransitionProps) {
  const [stage, setStage] = useState<'entering' | 'showing' | 'exiting'>('entering');

  useEffect(() => {
    if (!isVisible) {
      setStage('entering');
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    // Show transition
    timeouts.push(setTimeout(() => {
      setStage('showing');
    }, 100 / speed));

    // Start exit after display time
    timeouts.push(setTimeout(() => {
      setStage('exiting');
    }, (1500 / speed)));

    // Complete transition
    timeouts.push(setTimeout(() => {
      onComplete();
    }, (2000 / speed)));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isVisible, onComplete, speed]);

  if (!isVisible) return null;

  const getPlayerAvatar = (player: Player | AIPlayer) => {
    if (player.character?.avatar_face) {
      if (typeof player.character.avatar_face === "string" && player.character.avatar_face.endsWith(".png")) {
        return (
          <img
            src={player.character.avatar_face}
            alt={player.character.name}
            className="w-full h-full object-cover rounded-full"
          />
        );
      }
      return player.character.avatar_face;
    }
    return <User className="w-6 h-6" />;
  };

  const isAI = (player: Player | AIPlayer): player is AIPlayer => {
    return 'aiPersonality' in player;
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-all duration-300 ${
        stage === 'entering' ? 'opacity-0' : 
        stage === 'showing' ? 'opacity-100' :
        'opacity-0'
      }`}
    >
      <Card 
        className={`p-8 bg-gradient-parchment border-2 border-accent/50 max-w-md w-full mx-4 transition-all duration-500 ${
          stage === 'entering' ? 'scale-75 translate-y-8' : 
          stage === 'showing' ? 'scale-100 translate-y-0' :
          'scale-110 -translate-y-4'
        }`}
      >
        <div className="text-center space-y-6">
          {/* Current Player */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-3 border-primary bg-card flex items-center justify-center overflow-hidden shadow-lg">
                {getPlayerAvatar(currentPlayer)}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-primary ancient-title">
                  {currentPlayer.name}
                </h2>
                {isAI(currentPlayer) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    AI
                  </Badge>
                )}
              </div>
              <p className="text-lg text-accent font-medium">
                {currentPlayer.money} denarii
              </p>
            </div>
          </div>

          {/* Turn Indicator */}
          <div className="flex items-center justify-center">
            <div className="bg-primary/10 px-6 py-3 rounded-full border border-primary/30">
              <div className="flex items-center gap-3 text-primary">
                <Crown className="w-5 h-5" />
                <span className="font-bold ancient-text">Your Turn</span>
              </div>
            </div>
          </div>

          {/* Next Player Preview */}
          {nextPlayer && (
            <div className="pt-4 border-t border-accent/30">
              <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
                <span>Next:</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center overflow-hidden">
                    {getPlayerAvatar(nextPlayer)}
                  </div>
                  <span>{nextPlayer.name}</span>
                  {isAI(nextPlayer) && <Bot className="w-3 h-3" />}
                </div>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
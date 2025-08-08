import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/game';
import { ArrowRight, Crown } from 'lucide-react';

interface PlayerOrderPanelProps {
  players: Player[];
  currentPlayerIndex: number;
}

export default function PlayerOrderPanel({ players, currentPlayerIndex }: PlayerOrderPanelProps) {
  const getNextPlayer = (index: number) => {
    return (index + 1) % players.length;
  };

  return (
    <Card className="p-4 bg-gradient-parchment border-2 border-primary/30">
      <h3 className="font-bold text-primary ancient-text mb-3 flex items-center">
        <Crown className="w-4 h-4 mr-2" />
        Turn Order
      </h3>
      <div className="space-y-2">
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const isNextPlayer = index === getNextPlayer(currentPlayerIndex);
          
          return (
            <div
              key={player.id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                isCurrentPlayer 
                  ? 'bg-accent/20 ring-2 ring-accent' 
                  : isNextPlayer 
                  ? 'bg-secondary/20 border border-secondary' 
                  : 'bg-background/50'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: player.color,
                  borderColor: isCurrentPlayer ? 'hsl(var(--accent))' : 'hsl(var(--border))'
                }}
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isCurrentPlayer ? 'text-accent' : 'text-foreground'
                }`}>
                  {player.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {player.character.name}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {isCurrentPlayer && (
                  <Badge variant="default" className="text-xs bg-accent">
                    Active
                  </Badge>
                )}
                {isNextPlayer && (
                  <Badge variant="outline" className="text-xs">
                    Next
                  </Badge>
                )}
                {isCurrentPlayer && (
                  <ArrowRight className="w-3 h-3 text-accent animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
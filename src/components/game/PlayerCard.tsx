import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/game';
import { Church, Building2, Coins } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  onBuildChurch: () => void;
  onBuildSynagogue: () => void;
  canBuild: boolean;
}

const PlayerCard = ({ 
  player, 
  isCurrentPlayer, 
  onBuildChurch, 
  onBuildSynagogue, 
  canBuild 
}: PlayerCardProps) => {
  const getPlayerColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'hsl(var(--game-player1))': 'border-game-player1 bg-game-player1/10',
      'hsl(var(--game-player2))': 'border-game-player2 bg-game-player2/10',
      'hsl(var(--game-player3))': 'border-game-player3 bg-game-player3/10',
      'hsl(var(--game-player4))': 'border-game-player4 bg-game-player4/10',
      'hsl(var(--game-player5))': 'border-game-player5 bg-game-player5/10',
      'hsl(var(--game-player6))': 'border-game-player6 bg-game-player6/10',
    };
    return colorMap[color] || 'border-primary bg-primary/10';
  };

  return (
    <Card className={`p-4 transition-all duration-300 ${
      isCurrentPlayer 
        ? 'ring-2 ring-accent shadow-glow transform scale-105' 
        : 'hover:shadow-ancient'
    } ${getPlayerColorClass(player.color)} bg-gradient-parchment`}>






<div className="flex space-x-3">
  {/* Avatar */}
  <div className="w-20 flex-shrink-0">
    {typeof player.character.avatar === "string" && player.character.avatar.endsWith(".png") ? (
      <img
        src={player.character.avatar}
        alt={player.character.name}
        className="w-full h-full object-cover rounded-lg"
      />
    ) : (
      player.character.avatar
    )}
  </div>

  {/* Details */}
  <div className="flex-1 flex flex-col justify-between space-y-3">
    {/* Player Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-bold text-primary ancient-text">{player.name}</h3>
        <p className="text-sm text-muted-foreground">{player.character.name}</p>
        {player.inJail && (
          <div className="text-xs text-orange-500 font-medium">🔒 In Prison ({player.jailTurns}/3)</div>
        )}
        {player.skipNextTurn && (
          <div className="text-xs text-blue-500 font-medium">⏸️ Skip Next Turn</div>
        )}
        {player.immunityUntil > 0 && (
          <div className="text-xs text-green-500 font-medium">🛡️ Immunity Active</div>
        )}
      </div>
      {isCurrentPlayer && (
        <Badge variant="default" className="bg-accent text-accent-foreground">
          Current
        </Badge>
      )}
    </div>

    {/* Money */}
    <div className="flex items-center space-x-2 bg-card/50 rounded-lg p-2">
      <Coins className="w-4 h-4 text-accent" />
      <span className="font-bold text-accent ancient-text">{player.money} denarii</span>
    </div>

    {/* Properties */}
    <div className="text-sm">
      <p className="text-muted-foreground">Properties: {player.properties.length}</p>
    </div>

    {/* Special Ability */}
    <div className="text-xs p-2 bg-secondary/50 rounded-lg">
      <p className="font-semibold text-secondary-foreground">Special Ability:</p>
      <p className="text-secondary-foreground/80">{player.character.specialAbility}</p>
    </div>

    {/* Building Actions */}
    {isCurrentPlayer && canBuild && (
      <div className="space-y-2 pt-2 border-t border-border">
        <Button
          onClick={onBuildChurch}
          size="sm"
          variant="outline"
          className="w-full text-xs hover:bg-game-church/20"
        >
          <Church className="w-3 h-3 mr-1" />
          Build Church
        </Button>
        <Button
          onClick={onBuildSynagogue}
          size="sm"
          variant="outline"
          className="w-full text-xs hover:bg-game-synagogue/20"
        >
          <Building2 className="w-3 h-3 mr-1" />
          Build Synagogue
        </Button>
      </div>
    )}
  </div>
</div>





      
    </Card>
  );
};

export default PlayerCard;
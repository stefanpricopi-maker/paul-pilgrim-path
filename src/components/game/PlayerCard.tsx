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
    <Card
  className={`p-4 transition-all duration-300 overflow-hidden ${
    isCurrentPlayer ? 'ring-2 ring-accent shadow-glow transform scale-105' : 'hover:shadow-ancient'
  } ${getPlayerColorClass(player.color)} bg-gradient-parchment`}
>
  {/* Two-column layout: avatar (full height) + details */}
  <div className="flex items-stretch gap-3">
    {/* Avatar column (full height) */}
    <div className="relative w-20 sm:w-24 md:w-28 flex-shrink-0 self-stretch rounded-xl overflow-hidden border-2 border-primary/30">
      {(player as any).avatar_url ? (
        <img
          src={(player as any).avatar_url}
          alt={player.name}
          className="h-full w-full object-cover object-top"
        />
      ) : (player.character as any).full_image_url ? (
        <img
          src={(player.character as any).full_image_url}
          alt={player.character.name || 'Avatar'}
          className="h-full w-full object-cover object-top"
          onError={(e) => {
            console.log('Failed to load full_image_url:', (player.character as any).full_image_url);
            console.log('Player character object:', player.character);
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : typeof player.character.avatar === 'string' &&
        /\.(png|jpe?g|gif|webp|svg)$/i.test(player.character.avatar) ? (
        <img
          src={player.character.avatar.startsWith('/') ? player.character.avatar : `/${player.character.avatar}`}
          alt={player.character.name || 'Avatar'}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          {player.character.avatar && typeof player.character.avatar === 'string' && 
           /\.(png|jpe?g|gif|webp|svg)$/i.test(player.character.avatar) ? (
            <img
              src={player.character.avatar.startsWith('/') ? player.character.avatar : `/${player.character.avatar}`}
              alt={player.character.name || 'Avatar'}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <span className="text-5xl">{player.character.avatar || '👤'}</span>
          )}
        </div>
      )}
    </div>

    {/* Details column */}
    <div className="flex-1 flex flex-col space-y-3 min-w-0">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-bold text-primary ancient-text leading-tight truncate">
            {player.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {player.character.name}
          </p>
        </div>

        {isCurrentPlayer && (
          <Badge variant="default" className="bg-accent text-accent-foreground px-2 py-1 text-xs shrink-0">
            Current
          </Badge>
        )}
      </div>

      {/* Status badges */}
      {(player.inJail || player.skipNextTurn || player.immunityUntil > 0) && (
        <div className="flex flex-wrap gap-2">
          {player.inJail && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
              🔒 In Prison ({player.jailTurns}/3)
            </span>
          )}
          {player.skipNextTurn && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
              ⏸️ Skip Next Turn
            </span>
          )}
          {player.immunityUntil > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
              🛡️ Immunity Active
            </span>
          )}
        </div>
      )}

      {/* Money */}
      <div className="flex items-center space-x-2 bg-card/50 rounded-lg p-2 shadow-inner">
        <Coins className="w-4 h-4 text-accent" />
        <span className="font-bold text-accent ancient-text text-lg">
          {player.money.toLocaleString()} denarii
        </span>
      </div>

      {/* Properties */}
      <div className="text-sm">
        <p className="text-muted-foreground">Properties: {player.properties.length}</p>
      </div>

      {/* Special Ability */}
      {player.character.specialAbility && (
        <div className="text-xs p-2 bg-secondary/50 rounded-lg border border-secondary/30">
          <p className="font-semibold text-secondary-foreground">Special Ability:</p>
          <p className="text-secondary-foreground/80">{player.character.specialAbility}</p>
        </div>
      )}

      {/* Building Actions */}
      {isCurrentPlayer && canBuild && (
        <div className="pt-2 border-t border-border space-y-2">
          <Button
            onClick={onBuildChurch}
            size="sm"
            variant="outline"
            className="w-full text-xs flex items-center justify-center hover:bg-game-church/20"
          >
            <Church className="w-3 h-3 mr-1" />
            Build Church
          </Button>
          <Button
            onClick={onBuildSynagogue}
            size="sm"
            variant="outline"
            className="w-full text-xs flex items-center justify-center hover:bg-game-synagogue/20"
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
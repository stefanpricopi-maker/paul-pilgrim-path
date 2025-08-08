import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player, GameLocation } from '@/types/game';
import { Coins, MapPin, Building, TrendingUp, Trophy } from 'lucide-react';

interface PlayerStatsPanelProps {
  players: Player[];
  locations: GameLocation[];
}

export default function PlayerStatsPanel({ players, locations }: PlayerStatsPanelProps) {
  const getPlayerStats = (player: Player) => {
    const ownedProperties = locations.filter(loc => loc.owner === player.id);
    const totalValue = ownedProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);
    const totalIncome = ownedProperties.reduce((sum, prop) => sum + (prop.rent || 0), 0);
    const netWorth = player.money + totalValue;
    
    return {
      properties: ownedProperties.length,
      totalValue,
      totalIncome,
      netWorth
    };
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const aStats = getPlayerStats(a);
    const bStats = getPlayerStats(b);
    return bStats.netWorth - aStats.netWorth;
  });

  return (
    <Card className="p-4 bg-gradient-parchment border-2 border-primary/30">
      <h3 className="font-bold text-primary ancient-text mb-3 flex items-center">
        <TrendingUp className="w-4 h-4 mr-2" />
        Player Statistics
      </h3>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const stats = getPlayerStats(player);
          const isLeader = index === 0;
          
          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg border transition-all ${
                isLeader 
                  ? 'bg-accent/10 border-accent ring-1 ring-accent/30' 
                  : 'bg-background/50 border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium text-sm">{player.name}</span>
                  {isLeader && (
                    <Trophy className="w-3 h-3 text-accent" />
                  )}
                </div>
                <Badge 
                  variant={isLeader ? "default" : "outline"} 
                  className="text-xs"
                >
                  #{index + 1}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Coins className="w-3 h-3 text-accent" />
                  <span className="text-muted-foreground">Cash:</span>
                  <span className="font-medium">{player.money}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-secondary" />
                  <span className="text-muted-foreground">Props:</span>
                  <span className="font-medium">{stats.properties}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">{stats.totalValue}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground">Worth:</span>
                  <span className="font-medium text-accent">{stats.netWorth}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
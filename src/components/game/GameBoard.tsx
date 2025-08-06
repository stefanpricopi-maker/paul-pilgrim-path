import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameLocation, Player } from '@/types/game';
import { Church, Building2, Anchor, Crown, MapPin } from 'lucide-react';

interface GameBoardProps {
  locations: GameLocation[];
  players: Player[];
  onLocationClick: (location: GameLocation) => void;
}

const GameBoard = ({ locations, players, onLocationClick }: GameBoardProps) => {
  const getPlayersAtLocation = (locationIndex: number) => {
    return players.filter(player => player.position === locationIndex);
  };

  const getLocationIcon = (location: GameLocation) => {
    if (location.type === 'port') return <Anchor className="w-4 h-4" />;
    if (location.type === 'special') return <Crown className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const getJourneyColor = (journey: number) => {
    const colors = {
      1: 'border-red-400 bg-red-50',
      2: 'border-blue-400 bg-blue-50',
      3: 'border-green-400 bg-green-50',
      4: 'border-purple-400 bg-purple-50'
    };
    return colors[journey as keyof typeof colors] || 'border-gray-400 bg-gray-50';
  };

  // Create a 3x8 grid layout for the board
  const createBoardLayout = () => {
    const boardSize = 24;
    const topRow = locations.slice(0, 8);
    const rightColumn = locations.slice(8, 11);
    const bottomRow = locations.slice(11, 19).reverse();
    const leftColumn = locations.slice(19, 22).reverse();
    
    const board: (GameLocation | null)[][] = Array(3).fill(null).map(() => Array(8).fill(null));
    
    // Top row
    topRow.forEach((location, index) => {
      if (index < 8) board[0][index] = location;
    });
    
    // Right column
    rightColumn.forEach((location, index) => {
      if (index < 3) board[index][7] = location;
    });
    
    // Bottom row
    bottomRow.forEach((location, index) => {
      if (index < 8) board[2][7 - index] = location;
    });
    
    // Left column
    leftColumn.forEach((location, index) => {
      if (index < 3) board[2 - index][0] = location;
    });
    
    return board;
  };

  const boardLayout = createBoardLayout();

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Board Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-primary ancient-text mb-2">
          Paul's Missionary Journeys
        </h2>
        <p className="text-muted-foreground">
          Follow in the footsteps of the great apostle
        </p>
      </div>

      {/* Game Board */}
      <div className="relative bg-gradient-board rounded-2xl p-6 shadow-ancient border-4 border-accent/30">
        {/* Center area with journey descriptions */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Card className="w-80 h-60 p-6 bg-gradient-parchment/90 border-2 border-primary/30">
            <div className="text-center space-y-3 ancient-text">
              <h3 className="text-xl font-bold text-primary">The Four Journeys</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Badge className="bg-red-100 text-red-800 border-red-300">Journey 1</Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">Journey 2</Badge>
                <Badge className="bg-green-100 text-green-800 border-green-300">Journey 3</Badge>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">Journey 4</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Build churches and synagogues to spread the Gospel throughout the ancient world
              </p>
            </div>
          </Card>
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-8 grid-rows-3 gap-2 min-h-[480px]">
          {boardLayout.map((row, rowIndex) =>
            row.map((location, colIndex) => {
              const locationIndex = locations.findIndex(loc => loc?.id === location?.id);
              const playersHere = getPlayersAtLocation(locationIndex);
              
              return (
                <div key={`${rowIndex}-${colIndex}`} className="relative">
                  {location ? (
                    <Card
                      className={`board-cell h-full min-h-[120px] p-2 cursor-pointer hover:scale-105 transition-all ${getJourneyColor(location.journey)} border-2`}
                      onClick={() => onLocationClick(location)}
                    >
                      <div className="h-full flex flex-col justify-between text-xs">
                        {/* Location Header */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            {getLocationIcon(location)}
                            <Badge variant="outline" className="text-xs">
                              J{location.journey}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-xs leading-tight ancient-text">
                            {location.name}
                          </h4>
                        </div>

                        {/* Buildings */}
                        {(location.buildings.churches > 0 || location.buildings.synagogues > 0) && (
                          <div className="flex justify-center space-x-1">
                            {Array.from({ length: location.buildings.churches }).map((_, i) => (
                              <Church key={`church-${i}`} className="w-3 h-3 text-game-church" />
                            ))}
                            {Array.from({ length: location.buildings.synagogues }).map((_, i) => (
                              <Building2 key={`synagogue-${i}`} className="w-3 h-3 text-game-synagogue" />
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        {location.price > 0 && (
                          <div className="text-center">
                            <span className="text-accent font-bold">{location.price}d</span>
                          </div>
                        )}

                        {/* Players */}
                        {playersHere.length > 0 && (
                          <div className="flex justify-center flex-wrap gap-1">
                            {playersHere.map((player, index) => (
                              <div
                                key={player.id}
                                className="player-piece text-lg transform hover:scale-110"
                                style={{ 
                                  color: player.color,
                                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                                }}
                              >
                                {player.character.avatar}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <div className="h-full min-h-[120px]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Card as UICard } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameLocation, Player } from '@/types/game';
import { Church, Building2, Anchor, Crown, MapPin, Lock, ArrowRight, Dice1, Gift, Scale, Flame, User } from 'lucide-react';
import AnimatedPlayerPiece from './AnimatedPlayerPiece';

interface GameBoardProps {
  locations: GameLocation[];
  players: Player[];
  onLocationClick: (location: GameLocation) => void;
  animatingPlayer?: string;
  targetPosition?: number;
  onAnimationComplete?: () => void;
  gameLog?: string[];
}

const GameBoard = ({
  locations,
  players,
  onLocationClick,
  animatingPlayer,
  targetPosition,
  onAnimationComplete,
  gameLog
}: GameBoardProps) => {
  const getPlayersAtLocation = (locationIndex: number) => {
    return players.filter(player => player.position === locationIndex);
  };

  const getLocationIcon = (location: GameLocation) => {
    switch (location.type) {
      case 'port':
        return <Anchor className="w-4 h-4 text-white" />;
      case 'city':
        return <Building2 className="w-4 h-4 text-white" />;
      case 'special':
        if (location.id === 'sabat') {
          return <Crown className="w-4 h-4 text-white" />;
        }
        return <Crown className="w-4 h-4 text-white" />;
      case 'prison':
        return <Lock className="w-4 h-4 text-white" />;
      case 'go-to-prison':
        return <ArrowRight className="w-4 h-4 text-white" />;
      case 'chance':
        return <Dice1 className="w-4 h-4 text-white" />;
      case 'community-chest':
        return <Gift className="w-4 h-4 text-white" />;
      case 'court':
        return <Scale className="w-4 h-4 text-white" />;
      case 'sacrifice':
        return <Flame className="w-4 h-4 text-white" />;
      default:
        return <MapPin className="w-4 h-4 text-white" />;
    }
  };

  // Create the board layout for clockwise movement starting from bottom-right
  const createBoardLayout = () => {
    const board: (GameLocation | null)[][] = Array(11).fill(null).map(() => Array(11).fill(null));

    // Bottom row (right to left on screen, positions 10,9,8,7,6,5,4,3,2,1,0)
    for (let i = 0; i <= 10; i++) {
      board[10][10 - i] = locations[i];
    }

    // Left column (bottom to top on screen, positions 11,12,13,14,15,16,17,18,19)
    for (let i = 11; i <= 19; i++) {
      board[10 - (i - 10)][0] = locations[i];
    }

    // Top row (left to right on screen, positions 20,21,22,23,24,25,26,27,28,29,30)
    for (let i = 20; i <= 30; i++) {
      board[0][i - 20] = locations[i];
    }

    // Right column (top to bottom on screen, positions 31,32,33,34,35,36,37,38,39)
    for (let i = 31; i <= 39; i++) {
      board[i - 30][10] = locations[i];
    }

    return board;
  };

  const boardLayout = createBoardLayout();

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Game Board */}
      <div className="relative bg-gradient-board rounded-2xl p-6 shadow-ancient border-4 border-accent/30">
        {/* Center area with journey log */}
        <div className="absolute inset-0 flex items-start justify-center pt-40 pointer-events-none">
          <Card className="w-80 h-100 p-6 bg-gradient-parchment border-2 border-primary/30 pointer-events-auto">
            <div className="text-center space-y-3 ancient-text h-full flex flex-col">
              <h3 className="text-xl font-bold text-primary">Journey Log</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {gameLog && gameLog.length > 0 ? (
                    gameLog.slice().reverse().map((entry, index) => (
                      <p key={index} className="text-sm text-muted-foreground text-center leading-relaxed">
                        {entry}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center italic">
                      Your journey begins...
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>  
          </Card>
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-11 grid-rows-11 gap-0 min-h-[700px] relative">
          {boardLayout.map((row, rowIndex) => row.map((location, colIndex) => {
          const locationIndex = locations.findIndex(loc => loc?.id === location?.id);
          const playersHere = getPlayersAtLocation(locationIndex);

          // Only render cells on the outer edge
          const isCorner = (rowIndex === 0 && colIndex === 0) || (rowIndex === 0 && colIndex === 10) || (rowIndex === 10 && colIndex === 0) || (rowIndex === 10 && colIndex === 10);
          const isEdge = rowIndex === 0 || rowIndex === 10 || colIndex === 0 || colIndex === 10;
          if (!isEdge) {
            return <div key={`${rowIndex}-${colIndex}`} className="w-0 h-0" />;
          }
          
          // Determine orientation and sizing - make all tiles bigger and adjacent
          const isLeftColumn = colIndex === 0 && rowIndex > 0 && rowIndex < 10;
          const isRightColumn = colIndex === 10 && rowIndex > 0 && rowIndex < 10;
          const isTopRow = rowIndex === 0 && colIndex > 0 && colIndex < 10;
          const isBottomRow = rowIndex === 10 && colIndex > 0 && colIndex < 10;
          
          // Set bigger tile dimensions with no spacing
          let tileClasses = '';
          let contentClasses = 'flex-col';
          let stripOrientation = 'h-8 w-full';
          
          if (isCorner) {
            tileClasses = 'w-[120px] h-[120px]';
          } else if (isLeftColumn || isRightColumn) {
            // Make left/right tiles wider and taller
            tileClasses = 'w-[120px] h-[120px]';
          } else {
            // Make top/bottom tiles wider and taller  
            tileClasses = 'w-[90px] h-[120px]';
          }

          // Remove all text rotation
          const textRotation = '';
    
          return (
            <div key={`${rowIndex}-${colIndex}`} className="relative flex items-center justify-center -m-px">
              {location ? (
                <Card className={`board-cell ${tileClasses} p-0 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-gray-400 overflow-hidden bg-white -m-px`} 
                      onClick={() => onLocationClick(location)}>
                  <div className={`h-full flex ${contentClasses} relative`}>
                    {/* Color strip */}
                    <div 
                      className={stripOrientation}
                      style={{ backgroundColor: location.color || '#4a5568' }}
                    />
                    
                    {/* Content area */}
                    <div className="flex-1 p-2 flex flex-col justify-between min-h-0">
                      {/* City name and ownership */}
                      <div className="text-center space-y-1 flex-shrink-0">
                        <h4 className="text-[15px] font-semibold leading-snug text-black truncate">
                          {location.name}
                        </h4>
                        
                        {/* Enhanced ownership indicator */}
                        {location.owner && (
                          <div className="flex justify-center">
                            <div 
                              className="w-4 h-4 rounded-full border border-white shadow-sm"
                              style={{ 
                                backgroundColor: players.find(p => p.id === location.owner)?.color || '#666'
                              }}
                              title={`Owned by ${players.find(p => p.id === location.owner)?.name}`}
                            />
                          </div>
                        )}
                        
                        {/* Price indicator for unowned properties */}
                        {!location.owner && location.type === 'city' && location.price && (
                          <div className="text-sm font-bold text-green-700">
                            {location.price}
                          </div>
                        )}
                      </div>

                      {/* Buildings - only for cities */}
                      {location.type === 'city' && (location.buildings.churches > 0 || location.buildings.synagogues > 0) && (
                        <div className="flex justify-center space-x-1 flex-shrink-0">
                          {Array.from({ length: location.buildings.churches }).map((_, i) => (
                            <Church key={`church-${i}`} className="w-3 h-3 text-yellow-600" />
                          ))}
                          {Array.from({ length: location.buildings.synagogues }).map((_, i) => (
                            <Building2 key={`synagogue-${i}`} className="w-3 h-3 text-blue-600" />
                          ))}
                        </div>
                      )}

                       {/* Players */}
                      {playersHere.length > 0 && (
                        <div className="flex justify-center flex-wrap gap-1 flex-shrink-0">
                          {playersHere.map((player) => {
                            const isAnimating = animatingPlayer === player.id && targetPosition !== undefined;
                            return isAnimating ? (
                              <AnimatedPlayerPiece
                                key={player.id}
                                player={player}
                                isMoving={true}
                                targetPosition={targetPosition}
                                onAnimationComplete={onAnimationComplete}
                              />
                            ) : (
                              <div 
                                key={player.id} 
                                className="player-piece text-sm bg-white rounded-full w-5 h-5 flex items-center justify-center border transition-all duration-200 flex-shrink-0"
                                style={{
                                  borderColor: player.color,
                                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                                }}
                              >
                                {player.character.avatar}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <div className={`${tileClasses}`} />
              )}
            </div>
          );
        }))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
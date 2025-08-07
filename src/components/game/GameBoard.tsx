import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameLocation, Player } from '@/types/game';
import { Church, Building2, Anchor, Crown, MapPin, Lock, ArrowRight, Dice1, Gift, Scale, Flame } from 'lucide-react';
interface GameBoardProps {
  locations: GameLocation[];
  players: Player[];
  onLocationClick: (location: GameLocation) => void;
}
const GameBoard = ({
  locations,
  players,
  onLocationClick
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
  return <div className="w-full max-w-6xl mx-auto p-4">
      {/* Board Title */}
      {/* <div className="text-center mb-6"> 
        <h2 className="text-3xl font-bold text-primary ancient-text mb-2">
          Paul's Missionary Journeys
        </h2>
        <p className="text-muted-foreground">
          Follow in the footsteps of the great apostle
        </p>
      </div>*/}

      {/* Game Board */}
      <div className="relative bg-gradient-board rounded-2xl p-6 shadow-ancient border-4 border-accent/30">
        {/* Center area with journey descriptions */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/*<Card className="w-80 h-60 p-6 bg-gradient-parchment/90 border-2 border-primary/30">
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
          </Card>*/}
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-11 grid-rows-11 gap-1 min-h-[600px]">
          {boardLayout.map((row, rowIndex) => row.map((location, colIndex) => {
          const locationIndex = locations.findIndex(loc => loc?.id === location?.id);
          const playersHere = getPlayersAtLocation(locationIndex);

          // Only render cells on the outer edge
          const isCorner = rowIndex === 0 && colIndex === 0 || rowIndex === 0 && colIndex === 10 || rowIndex === 10 && colIndex === 0 || rowIndex === 10 && colIndex === 10;
          const isEdge = rowIndex === 0 || rowIndex === 10 || colIndex === 0 || colIndex === 10;
          if (!isEdge) {
            return <div key={`${rowIndex}-${colIndex}`} className="h-12" />;
          }
          // Determine rotation based on position
          const isLeftColumn = colIndex === 0 && rowIndex > 0 && rowIndex < 10; // positions 11-19
          const isRightColumn = colIndex === 10 && rowIndex > 0 && rowIndex < 10; // positions 31-39
          
          let rotationClass = '';
          let stripClass = 'h-6 w-full'; // wider strip for all tiles
          let contentLayout = 'flex-col';
          
          if (isLeftColumn) {
            rotationClass = '-rotate-90';
            stripClass = 'w-6 h-full'; // vertical strip on right side (inside)
            contentLayout = 'flex-row-reverse';
          } else if (isRightColumn) {
            rotationClass = '-rotate-90';
            stripClass = 'w-6 h-full'; // vertical strip on left side (inside)
            contentLayout = 'flex-row';
          }

          return <div key={`${rowIndex}-${colIndex}`} className="relative">
                  {location ? <Card className={`board-cell h-full ${isCorner ? 'min-h-[90px] min-w-[90px]' : 'min-h-[70px] min-w-[60px]'} p-0 cursor-pointer hover:scale-105 transition-all border-2 border-gray-300 shadow-md bg-white overflow-hidden ${rotationClass}`} onClick={() => onLocationClick(location)}>
                      <div className={`h-full flex ${contentLayout}`}>
                        {/* Color strip */}
                        <div 
                          className={stripClass}
                          style={{ backgroundColor: location.color || '#4a5568' }}
                        />
                        
                        {/* Content area */}
                        <div className="flex-1 p-2 flex flex-col justify-between">
                          {/* City name */}
                          <div className="text-center">
                            <h4 className="font-bold text-xs leading-tight text-black">
                              {location.name}
                            </h4>
                          </div>

                          {/* Buildings - only for cities */}
                          {location.type === 'city' && (location.buildings.churches > 0 || location.buildings.synagogues > 0) && <div className="flex justify-center space-x-1">
                              {Array.from({
                      length: location.buildings.churches
                    }).map((_, i) => <Church key={`church-${i}`} className="w-3 h-3 text-purple-600" />)}
                              {Array.from({
                      length: location.buildings.synagogues
                    }).map((_, i) => <Building2 key={`synagogue-${i}`} className="w-3 h-3 text-yellow-600" />)}
                            </div>}

                          {/* Players */}
                          {playersHere.length > 0 && <div className="flex justify-center flex-wrap gap-1">
                              {playersHere.map((player, index) => <div key={player.id} className="player-piece text-sm transform hover:scale-110 bg-white rounded-full w-5 h-5 flex items-center justify-center border-2" style={{
                      borderColor: player.color,
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                    }}>
                                  {player.character.avatar}
                                </div>)}
                            </div>}
                        </div>
                      </div>
                    </Card> : <div className="h-full min-h-[60px]" />}
                </div>;
        }))}
        </div>
      </div>
    </div>;
};
export default GameBoard;
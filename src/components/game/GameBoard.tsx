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

  // Create the board layout based on standard Monopoly layout
  const createBoardLayout = () => {
    // Bottom row (left to right): positions 0-10
    const bottomRow = locations.slice(0, 11);
    // Right column (bottom to top): positions 11-19 + GO TO PRISON at 20  
    const rightColumn = [...locations.slice(11, 20), locations[40]]; // Include GO TO PRISON from end
    // Top row (right to left): positions 20-30 (SABAT at 20, others follow)
    const topRow = locations.slice(20, 31);
    // Left column (top to bottom): positions 31-39
    const leftColumn = locations.slice(31, 40);
    const board: (GameLocation | null)[][] = Array(11).fill(null).map(() => Array(11).fill(null));

    // Bottom row
    bottomRow.forEach((location, index) => {
      board[10][index] = location;
    });

    // Right column
    rightColumn.forEach((location, index) => {
      board[9 - index][10] = location;
    });

    // Top row
    topRow.forEach((location, index) => {
      board[0][9 - index] = location;
    });

    // Left column
    leftColumn.forEach((location, index) => {
      board[index + 1][0] = location;
    });
    return board;
  };
  const boardLayout = createBoardLayout();
  return <div className="w-full max-w-6xl mx-auto p-4">
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
          return <div key={`${rowIndex}-${colIndex}`} className="relative">
                  {location ? <Card className={`board-cell h-full ${isCorner ? 'min-h-[90px] min-w-[90px]' : 'min-h-[70px] min-w-[60px]'} p-2 cursor-pointer hover:scale-105 transition-all border-2 border-primary/20 shadow-md`} style={{
              backgroundColor: location.color || '#f8f9fa',
              borderColor: location.type === 'special' || location.type === 'prison' || location.type === 'go-to-prison' ? '#4a5568' : '#e2e8f0'
            }} onClick={() => onLocationClick(location)}>
                      <div className="h-full flex flex-col justify-between text-xs">
                        {/* Location Header */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            {getLocationIcon(location)}
                            {!['special', 'prison', 'go-to-prison', 'chance', 'community-chest', 'court', 'sacrifice'].includes(location.type)}
                          </div>
                          <h4 className="font-bold text-xs leading-tight ancient-text drop-shadow-lg text-zinc-950">
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
                    </Card> : <div className="h-full min-h-[60px]" />}
                </div>;
        }))}
        </div>
      </div>
    </div>;
};
export default GameBoard;
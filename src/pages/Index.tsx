import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import GameLobby from '@/components/game/GameLobby';
import GameBoard from '@/components/game/GameBoard';
import PlayerCard from '@/components/game/PlayerCard';
import Dice from '@/components/game/Dice';
import { useGameDatabase } from '@/hooks/useGameDatabase';
import { useAuth } from '@/hooks/useAuth';
import { GameLocation } from '@/types/game';
import { BIBLICAL_CHARACTERS } from '@/types/game';
import { Church, Building2, Coins, MapPin, LogOut, User } from 'lucide-react';

const Index = () => {
  const { 
    gameState,
    loading,
    createGame,
    joinGame,
    startGame,
    rollDice,
    endTurn
  } = useGameDatabase();
  
  const { user, signOut } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<GameLocation | null>(null);

  // Show lobby if no game or game not started
  if (!gameState.game || !gameState.gameStarted) {
    return (
      <GameLobby
        gameState={gameState}
        loading={loading}
        onCreateGame={createGame}
        onJoinGame={joinGame}
        onStartGame={startGame}
      />
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentTile = gameState.tiles[currentPlayer?.position] || null;
  
  // Convert database player to game player format for compatibility
  const gamePlayersForDisplay = gameState.players.map(player => ({
    id: player.id,
    name: player.name,
    character: BIBLICAL_CHARACTERS.find(c => c.name === player.character_name) || BIBLICAL_CHARACTERS[0],
    position: player.position,
    money: player.coins,
    properties: [], // TODO: Load from tiles ownership
    color: `hsl(var(--player-${(gameState.players.indexOf(player) % 6) + 1}))`
  }));

  // Convert tiles to locations format for compatibility
  const gameLocationsForDisplay: GameLocation[] = gameState.tiles.map(tile => ({
    id: tile.id.toString(),
    name: tile.name,
    type: (tile.type as any) || 'city',
    journey: 1,
    price: 100, // TODO: Load from buildings table
    rent: 50,
    churchCost: 200,
    synagogueCost: 300,
    owner: tile.owner_id || undefined,
    buildings: {
      churches: 0, // TODO: Load from separate buildings relationship
      synagogues: 0
    },
    description: `Visit ${tile.name}`,
    color: tile.type === 'city' ? '#8B4513' : '#4A90E2'
  }));

  const canBuyProperty = false; // TODO: Implement property buying logic
  const canBuildOnCurrentLocation = false; // TODO: Implement building logic

  const handleLocationClick = (location: GameLocation) => {
    setSelectedLocation(location);
  };

  const handleBuyProperty = () => {
    // TODO: Implement Supabase property buying
  };

  const handleBuildChurch = () => {
    // TODO: Implement Supabase church building
  };

  const handleBuildSynagogue = () => {
    // TODO: Implement Supabase synagogue building
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Game Header */}
        <Card className="p-6 bg-gradient-parchment border-2 border-accent/30">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-primary ancient-text mb-2">
                Paul's Missionary Journeys
              </h1>
              {currentPlayer && (
                <p className="text-muted-foreground">
                  Current Player: <span className="font-bold text-accent">{currentPlayer.name}</span> 
                  ({currentPlayer.character_name})
                  {gameState.isMyTurn && <span className="ml-2 text-green-600">(Your Turn)</span>}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-1" />
                {user?.email}
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Board - Large Center Area */}
          <div className="lg:col-span-3">
            <GameBoard 
              locations={gameLocationsForDisplay}
              players={gamePlayersForDisplay}
              onLocationClick={handleLocationClick}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Dice */}
            <Dice 
              value={gameState.diceValue}
              isRolling={gameState.isRolling}
              onRoll={gameState.isMyTurn ? rollDice : () => {}}
            />

            {/* Current Location Info */}
            <Card className="p-4 bg-gradient-parchment border-2 border-primary/30">
              <h3 className="font-bold text-primary ancient-text mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Current Location
              </h3>
              <div className="space-y-3">
                {currentTile ? (
                  <div>
                    <h4 className="font-bold text-accent">{currentTile.name}</h4>
                    <p className="text-xs text-muted-foreground">Current location on the board</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-accent">Unknown Location</h4>
                    <p className="text-xs text-muted-foreground">Position data not available</p>
                  </div>
                )}
                
                {currentTile?.owner_id && (
                  <div className="text-xs text-muted-foreground">
                    Owned by: {gameState.players.find(p => p.id === currentTile.owner_id)?.name}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  {canBuyProperty && (
                    <Button 
                      onClick={handleBuyProperty}
                      className="w-full text-sm"
                      variant="default"
                      disabled
                    >
                      <Coins className="w-3 h-3 mr-1" />
                      Buy Property (Coming Soon)
                    </Button>
                  )}
                  
                  {canBuildOnCurrentLocation && (
                    <>
                      <Button 
                        onClick={handleBuildChurch}
                        className="w-full text-sm"
                        variant="outline"
                        disabled
                      >
                        <Church className="w-3 h-3 mr-1" />
                        Build Church (Coming Soon)
                      </Button>
                      <Button 
                        onClick={handleBuildSynagogue}
                        className="w-full text-sm"
                        variant="outline"
                        disabled
                      >
                        <Building2 className="w-3 h-3 mr-1" />
                        Build Synagogue (Coming Soon)
                      </Button>
                    </>
                  )}
                  
                  {gameState.diceValue > 0 && gameState.isMyTurn && (
                    <Button 
                      onClick={endTurn}
                      className="w-full"
                      variant="secondary"
                    >
                      End Turn
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Game Log */}
            <Card className="p-4 bg-gradient-parchment border-2 border-muted/30">
              <h3 className="font-bold text-primary ancient-text mb-3">Journey Log</h3>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {gameState.gameLog.map((entry, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {entry.description}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        {/* Players Panel - Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {gamePlayersForDisplay.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={index === gameState.currentPlayerIndex}
              onBuildChurch={handleBuildChurch}
              onBuildSynagogue={handleBuildSynagogue}
              canBuild={canBuildOnCurrentLocation && index === gameState.currentPlayerIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;

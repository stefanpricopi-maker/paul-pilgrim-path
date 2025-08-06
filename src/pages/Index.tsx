import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import GameSetup from '@/components/game/GameSetup';
import GameBoard from '@/components/game/GameBoard';
import PlayerCard from '@/components/game/PlayerCard';
import Dice from '@/components/game/Dice';
import { useGame } from '@/hooks/useGame';
import { GameLocation } from '@/types/game';
import { Church, Building2, Coins, MapPin } from 'lucide-react';

const Index = () => {
  const { 
    gameState, 
    startGame, 
    rollDice, 
    endTurn, 
    buyProperty, 
    buildChurch, 
    buildSynagogue 
  } = useGame();
  
  const [selectedLocation, setSelectedLocation] = useState<GameLocation | null>(null);

  if (!gameState.gameStarted) {
    return <GameSetup onStartGame={startGame} />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentLocation = gameState.locations[currentPlayer.position];
  const canBuyProperty = currentLocation && !currentLocation.owner && currentLocation.price > 0 && currentPlayer.money >= currentLocation.price;
  const canBuildOnCurrentLocation = currentLocation && currentLocation.owner === currentPlayer.id;

  const handleLocationClick = (location: GameLocation) => {
    setSelectedLocation(location);
  };

  const handleBuyProperty = () => {
    if (currentLocation) {
      buyProperty(currentLocation.id);
    }
  };

  const handleBuildChurch = () => {
    if (currentLocation) {
      buildChurch(currentLocation.id);
    }
  };

  const handleBuildSynagogue = () => {
    if (currentLocation) {
      buildSynagogue(currentLocation.id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Game Header */}
        <Card className="p-6 bg-gradient-parchment border-2 border-accent/30">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary ancient-text mb-2">
              Paul's Missionary Journeys
            </h1>
            <p className="text-muted-foreground">
              Current Player: <span className="font-bold text-accent">{currentPlayer.name}</span> 
              ({currentPlayer.character.name})
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Board - Large Center Area */}
          <div className="lg:col-span-3">
            <GameBoard 
              locations={gameState.locations}
              players={gameState.players}
              onLocationClick={handleLocationClick}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Dice */}
            <Dice 
              value={gameState.diceValue}
              isRolling={gameState.isRolling}
              onRoll={rollDice}
            />

            {/* Current Location Info */}
            <Card className="p-4 bg-gradient-parchment border-2 border-primary/30">
              <h3 className="font-bold text-primary ancient-text mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Current Location
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-accent">{currentLocation.name}</h4>
                  <p className="text-xs text-muted-foreground">{currentLocation.description}</p>
                </div>
                
                {currentLocation.price > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Price:</span>
                    <span className="font-bold text-accent">{currentLocation.price} denarii</span>
                  </div>
                )}
                
                {currentLocation.owner && (
                  <div className="text-xs text-muted-foreground">
                    Owned by: {gameState.players.find(p => p.id === currentLocation.owner)?.name}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  {canBuyProperty && (
                    <Button 
                      onClick={handleBuyProperty}
                      className="w-full text-sm"
                      variant="default"
                    >
                      <Coins className="w-3 h-3 mr-1" />
                      Buy Property ({currentLocation.price}d)
                    </Button>
                  )}
                  
                  {canBuildOnCurrentLocation && (
                    <>
                      <Button 
                        onClick={handleBuildChurch}
                        className="w-full text-sm"
                        variant="outline"
                        disabled={currentPlayer.money < currentLocation.churchCost}
                      >
                        <Church className="w-3 h-3 mr-1" />
                        Build Church ({currentLocation.churchCost}d)
                      </Button>
                      <Button 
                        onClick={handleBuildSynagogue}
                        className="w-full text-sm"
                        variant="outline"
                        disabled={currentPlayer.money < currentLocation.synagogueCost}
                      >
                        <Building2 className="w-3 h-3 mr-1" />
                        Build Synagogue ({currentLocation.synagogueCost}d)
                      </Button>
                    </>
                  )}
                  
                  {gameState.diceValue > 0 && (
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
                      {entry}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        {/* Players Panel - Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {gameState.players.map((player, index) => (
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

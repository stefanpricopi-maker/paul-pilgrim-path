import { useState } from 'react';
import { Card as UICard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import GameBoard from '@/components/game/GameBoard';
import PlayerCard from '@/components/game/PlayerCard';
import Dice from '@/components/game/Dice';
import { Player, GameLocation } from '@/types/game';
import { Card } from '@/types/cards';
import CardModal from './CardModal';
import { Church, Building2, Coins, MapPin, RotateCcw, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LocalGameBoardProps {
  gameState: {
    players: Player[];
    currentPlayerIndex: number;
    locations: GameLocation[];
    diceValue: number;
    isRolling: boolean;
    gameLog: string[];
    round: number;
    drawnCard: Card | null;
    cardType: 'community' | 'chance' | null;
  };
  currentPlayerPrivate: boolean;
  onRollDice: () => void;
  onEndTurn: () => void;
  onResetGame: () => void;
  onShowCurrentPlayer: () => void;
  onHideCurrentPlayer: () => void;
  onBuyLand?: (playerId: string, locationId: string) => void;
  onCardAction?: (card: Card) => void;
}

export default function LocalGameBoard({
  gameState,
  currentPlayerPrivate,
  onRollDice,
  onEndTurn,
  onResetGame,
  onShowCurrentPlayer,
  onHideCurrentPlayer,
  onBuyLand,
  onCardAction,
}: LocalGameBoardProps) {
  const [selectedLocation, setSelectedLocation] = useState<GameLocation | null>(null);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentLocation = gameState.locations[currentPlayer?.position] || null;

  const canBuyLand = currentLocation && !currentLocation.owner && currentLocation.type === 'city' && currentPlayer.money >= currentLocation.price;
  const canBuildOnCurrentLocation = false; // TODO: Implement building logic

  const handleLocationClick = (location: GameLocation) => {
    setSelectedLocation(location);
  };

  const handleBuyLand = () => {
    if (currentLocation && onBuyLand) {
      onBuyLand(currentPlayer.id, currentLocation.id);
    }
  };

  const handleBuildChurch = () => {
    // TODO: Implement local church building
  };

  const handleBuildSynagogue = () => {
    // TODO: Implement local synagogue building
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Game Header */}
        <UICard className="p-6 bg-gradient-parchment border-2 border-accent/30">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-primary ancient-text mb-2">
                Paul's Missionary Journeys - Local Game
              </h1>
              <p className="text-muted-foreground">
                Round {gameState.round} • {gameState.players.length} Players
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={onResetGame} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset Game
              </Button>
            </div>
          </div>
        </UICard>

        {/* Current Player Turn Banner */}
        {currentPlayerPrivate ? (
          <UICard className="p-4 bg-accent/10 border-2 border-accent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-accent"
                  style={{ backgroundColor: currentPlayer?.color }}
                />
                <div>
                  <h3 className="font-bold text-accent">
                    {currentPlayer?.name}'s Turn
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pass the device to {currentPlayer?.name}
                  </p>
                </div>
              </div>
              <Button onClick={onShowCurrentPlayer} size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Show My Turn
              </Button>
            </div>
          </UICard>
        ) : (
          <UICard className="p-4 bg-primary/10 border-2 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-primary"
                  style={{ backgroundColor: currentPlayer?.color }}
                />
                <div>
                  <h3 className="font-bold text-primary">
                    Your Turn, {currentPlayer?.name}!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Character: {currentPlayer?.character.name} • Money: {currentPlayer?.money} coins
                  </p>
                </div>
              </div>
              <Button onClick={onHideCurrentPlayer} variant="outline" size="sm">
                <EyeOff className="w-4 h-4 mr-2" />
                Hide
              </Button>
            </div>
          </UICard>
        )}

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
            {!currentPlayerPrivate && (
              <Dice 
                value={gameState.diceValue}
                isRolling={gameState.isRolling}
                onRoll={onRollDice}
              />
            )}

            {/* Current Location Info */}
            <UICard className="p-4 bg-gradient-parchment border-2 border-primary/30">
              <h3 className="font-bold text-primary ancient-text mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Current Location
              </h3>
              <div className="space-y-3">
                {currentLocation ? (
                  <div>
                    <h4 className="font-bold text-accent">{currentLocation.name}</h4>
                    <p className="text-xs text-muted-foreground">{currentLocation.description}</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-accent">Unknown Location</h4>
                    <p className="text-xs text-muted-foreground">Position data not available</p>
                  </div>
                )}
                
                {currentLocation?.owner && (
                  <div className="text-xs text-muted-foreground">
                    Owned by: {gameState.players.find(p => p.id === currentLocation.owner)?.name}
                  </div>
                )}
                
                 {/* Action Buttons */}
                {!currentPlayerPrivate && (
                  <div className="space-y-2">
                    {canBuyLand && (
                      <Button 
                        onClick={handleBuyLand}
                        className="w-full text-sm"
                        variant="default"
                      >
                        <Coins className="w-3 h-3 mr-1" />
                        Buy Land
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
                    
                    {gameState.diceValue > 0 && (
                      <Button 
                        onClick={onEndTurn}
                        className="w-full"
                        variant="secondary"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        End Turn
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </UICard>

            {/* Game Log */}
            <UICard className="p-4 bg-gradient-parchment border-2 border-muted/30">
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
            </UICard>
          </div>
        </div>

        {/* Players Panel - Bottom (only show when not private) */}
        {!currentPlayerPrivate && (
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
        )}
      </div>

      {/* Card Modal */}
      <CardModal
        isOpen={!!gameState.drawnCard}
        onClose={() => onCardAction && gameState.drawnCard && onCardAction(gameState.drawnCard)}
        card={gameState.drawnCard}
        cardType={gameState.cardType || 'community'}
        language="en"
      />
    </div>
  );
}
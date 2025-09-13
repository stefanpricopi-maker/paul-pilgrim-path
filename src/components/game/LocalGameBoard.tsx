import { useState } from 'react';
import { Card as UICard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import GameBoard from '@/components/game/GameBoard';
import PlayerCard from '@/components/game/PlayerCard';
import Dice from '@/components/game/Dice';
import { Player, GameLocation } from '@/types/game';
import { Card as GameCard } from '@/types/cards';
import { AIPlayer } from '@/types/ai';
import CardModal from './CardModal';
import GameSpeedControls, { GameSpeed } from './GameSpeedControls';
import { Church, Building2, Coins, MapPin, RotateCcw, Eye, EyeOff, ArrowRight, Menu, Users, BarChart3 } from 'lucide-react';
import PlayerOrderPanel from './PlayerOrderPanel';
import PlayerStatsPanel from './PlayerStatsPanel';
import { useIsMobile } from '@/hooks/use-mobile';

interface LocalGameBoardProps {
  gameState: {
    players: (Player | AIPlayer)[];
    currentPlayerIndex: number;
    locations: GameLocation[];
    gameStarted: boolean;
    dice1: number;
    dice2: number;
    isRolling: boolean;
    gameLog: string[];
    round: number;
    rentPaidThisTurn: Record<string, boolean>;
    showCardModal: boolean;
    drawnCard: GameCard | null;
    cardType: 'community' | 'chance' | null;
    aiDecision: any;
    isAIThinking: boolean;
  };
  onRollDice: () => void;
  onEndTurn: () => void;
  onResetGame: () => void;
  onBuyLand?: (playerId: string, locationId: string) => void;
  onBuildChurch?: (playerId: string, locationId: string) => void;
  onBuildSynagogue?: (playerId: string, locationId: string) => void;
  onPayRent?: (playerId: string, locationId: string) => void;
  onCardAction?: (card: GameCard) => void;
  gameSpeed?: GameSpeed;
  onSpeedChange?: (speed: GameSpeed) => void;
}

export default function LocalGameBoard({
  gameState,
  onRollDice,
  onEndTurn,
  onResetGame,
  onBuyLand,
  onBuildChurch,
  onBuildSynagogue,
  onPayRent,
  onCardAction,
  gameSpeed,
  onSpeedChange,
}: LocalGameBoardProps) {
  const [selectedLocation, setSelectedLocation] = useState<GameLocation | null>(null);
  const isMobile = useIsMobile();

  // Default speed settings
  const defaultSpeed: GameSpeed = {
    diceSpeed: 1,
    playerMoveSpeed: 1,
    aiThinkingSpeed: 1,
    cardDisplayTime: 1,
    animationsEnabled: true,
  };

  const currentSpeed = gameSpeed || defaultSpeed;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentLocation = gameState.locations[currentPlayer?.position] || null;
  
  const canBuyLand = currentLocation && !currentLocation.owner && currentLocation.type === 'city' && currentPlayer?.money >= currentLocation.price;
  const canBuildOnCurrentLocation = currentLocation && currentLocation.owner === currentPlayer?.id && currentLocation.type === 'city';
  const hasAlreadyPaidRent = currentLocation ? gameState.rentPaidThisTurn[currentLocation.id] || false : false;
  const needsToPayRent = currentLocation && currentLocation.owner && currentLocation.owner !== currentPlayer?.id && currentLocation.rent > 0 && !hasAlreadyPaidRent;

  const handleLocationClick = (location: GameLocation) => {
    setSelectedLocation(location);
  };

  const handleBuyLand = () => {
    if (currentLocation && onBuyLand && currentPlayer?.id) {
      onBuyLand(currentPlayer.id, currentLocation.id);
    }
  };

  const handleBuildChurch = () => {
    if (currentLocation && onBuildChurch && currentPlayer?.id) {
      onBuildChurch(currentPlayer.id, currentLocation.id);
    }
  };

  const handleBuildSynagogue = () => {
    if (currentLocation && onBuildSynagogue && currentPlayer?.id) {
      onBuildSynagogue(currentPlayer.id, currentLocation.id);
    }
  };

  const handlePayRent = () => {
    if (currentLocation && onPayRent && currentPlayer?.id) {
      onPayRent(currentPlayer.id, currentLocation.id);
    }
  };

  const MobilePlayerSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Users className="w-4 h-4 mr-1" />
          Players
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Player Order & Stats</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full pt-4">
          <div className="space-y-4">
            <PlayerOrderPanel 
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
            />
            <PlayerStatsPanel 
              players={gameState.players}
              locations={gameState.locations}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* Game Header */}
        <UICard className="p-4 md:p-6 bg-gradient-parchment border-2 border-accent/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-primary ancient-title mb-2">
                Paul's Missionary Journeys - Local Game
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Round {gameState.round} • {gameState.players.length} Players
              </p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              {isMobile && <MobilePlayerSheet />}
              {onSpeedChange && (
                <GameSpeedControls
                  speed={currentSpeed}
                  onChange={onSpeedChange}
                  className="hidden md:flex"
                />
              )}
              <Button onClick={onResetGame} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                {isMobile ? 'Reset' : 'Reset Game'}
              </Button>
            </div>
          </div>
        </UICard>

        {/* Current Player Turn Banner */}
        <UICard className="p-3 md:p-4 bg-accent/10 border-2 border-accent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden">
                {currentPlayer?.character?.avatar ? (
                  typeof currentPlayer.character.avatar === "string" &&
                  currentPlayer.character.avatar.endsWith(".png") ? (
                    <img
                      src={currentPlayer.character.avatar}
                      alt={currentPlayer.character.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentPlayer.character.avatar // emoji or JSX
                  )
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg">{currentPlayer?.name || 'Unknown Player'}'s Turn</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {currentPlayer ? `${currentPlayer.money} denarii` : '0 denarii'}
                  {gameState.round > 1 && ` • Round ${gameState.round}`}
                </p>
              </div>
            </div>
          </div>
        </UICard>

        {isMobile ? (
          /* Mobile Layout */
          <div className="space-y-4">
            {/* Game Board */}
            <GameBoard 
              locations={gameState.locations}
              players={gameState.players}
              onLocationClick={handleLocationClick}
              gameLog={gameState.gameLog}
            />
            
            {/* Mobile Control Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dice */}
              <div className="order-1">
                <Dice
                  dice1={gameState.dice1}
                  dice2={gameState.dice2}
                  isRolling={gameState.isRolling}
                  onRoll={onRollDice}
                />
              </div>

              {/* Current Location Info */}
              <UICard className="p-3 bg-gradient-parchment border-2 border-primary/30 order-2">
                <h3 className="font-bold text-primary ancient-text mb-2 flex items-center text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  Current Location
                </h3>
                <div className="space-y-2">
                  {currentLocation ? (
                    <div>
                      <h4 className="font-bold text-accent text-sm">{currentLocation.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{currentLocation.description}</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-accent text-sm">Unknown Location</h4>
                      <p className="text-xs text-muted-foreground">Position data not available</p>
                    </div>
                  )}
                  
                  {currentLocation?.owner && (
                    <div className="text-xs text-muted-foreground">
                      Owned by: {gameState.players.find(p => p.id === currentLocation.owner)?.name}
                    </div>
                  )}
                </div>
              </UICard>
            </div>

            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-1 gap-2">
              {onSpeedChange && (
                <GameSpeedControls
                  speed={currentSpeed}
                  onChange={onSpeedChange}
                  className="w-full justify-center"
                />
              )}
              
              {(needsToPayRent || hasAlreadyPaidRent) && (
                <Button 
                  onClick={handlePayRent}
                  className="w-full text-sm h-12"
                  variant={hasAlreadyPaidRent ? "outline" : "destructive"}
                  disabled={hasAlreadyPaidRent}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  {hasAlreadyPaidRent ? "Rent Paid ✓" : `Pay Rent (${currentLocation?.rent} denarii)`}
                </Button>
              )}

              {canBuyLand && (
                <Button 
                  onClick={handleBuyLand}
                  className="w-full text-sm h-12"
                  variant="default"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Buy Land ({currentLocation?.price} denarii)
                </Button>
              )}
              
              {canBuildOnCurrentLocation && (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleBuildChurch}
                    className="w-full text-xs h-12"
                    variant="outline"
                    disabled={currentPlayer.money < (currentLocation?.churchCost || 0)}
                  >
                    <Church className="w-3 h-3 mr-1" />
                    Church ({currentLocation?.churchCost})
                  </Button>
                  <Button 
                    onClick={handleBuildSynagogue}
                    className="w-full text-xs h-12"
                    variant="outline"
                    disabled={currentPlayer.money < (currentLocation?.synagogueCost || 0)}
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    Synagogue ({currentLocation?.synagogueCost})
                  </Button>
                </div>
              )}
              
              {/* End Turn Button */}
              <Button 
                onClick={onEndTurn}
                className="w-full text-sm h-12"
                variant="secondary"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                End Turn
              </Button>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Game Board and Journey Log - Large Center Area */}
            <div className="lg:col-span-3 space-y-6">
              <GameBoard 
                locations={gameState.locations}
                players={gameState.players}
                onLocationClick={handleLocationClick}
                gameLog={gameState.gameLog}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Dice */}
              <Dice
                  dice1={gameState.dice1}
                  dice2={gameState.dice2}
                  isRolling={gameState.isRolling}
                onRoll={onRollDice}
              />

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
                  <div className="space-y-2">
                       {(needsToPayRent || hasAlreadyPaidRent) && (
                        <Button 
                          onClick={handlePayRent}
                          className="w-full text-sm"
                          variant={hasAlreadyPaidRent ? "outline" : "destructive"}
                          disabled={hasAlreadyPaidRent}
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          {hasAlreadyPaidRent ? "Rent Paid ✓" : `Pay Rent (${currentLocation.rent} denarii)`}
                        </Button>
                      )}

                      {canBuyLand && (
                        <Button 
                          onClick={handleBuyLand}
                          className="w-full text-sm"
                          variant="default"
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          Buy Land ({currentLocation.price} denarii)
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
                            Build Church ({currentLocation.churchCost} denarii)
                          </Button>
                          <Button 
                            onClick={handleBuildSynagogue}
                            className="w-full text-sm"
                            variant="outline"
                            disabled={currentPlayer.money < currentLocation.synagogueCost}
                          >
                            <Building2 className="w-3 h-3 mr-1" />
                            Build Synagogue ({currentLocation.synagogueCost} denarii)
                          </Button>
                        </>
                      )}
                      
                      {/* End Turn Button */}
                      <Button 
                        onClick={onEndTurn}
                        className="w-full text-sm"
                        variant="secondary"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        End Turn
                      </Button>
                  </div>
                </div>
              </UICard>
              
              {/* Player Order Panel */}
              <PlayerOrderPanel 
                players={gameState.players}
                currentPlayerIndex={gameState.currentPlayerIndex}
              />

              {/* Player Statistics Panel */}
              <PlayerStatsPanel 
                players={gameState.players}
                locations={gameState.locations}
              />
            </div>
          </div>
        )}

        {/* Players Panel - Bottom - Hidden on mobile (accessible via sheet) */}
        <div className={`${isMobile ? 'hidden' : 'grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4`}>
          {gameState.players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={index === gameState.currentPlayerIndex}
              onBuildChurch={() => {/* Handled via current location actions */}}
              onBuildSynagogue={() => {/* Handled via current location actions */}}
              canBuild={false}
            />
          ))}
        </div>
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
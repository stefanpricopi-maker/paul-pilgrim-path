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
import TurnTransition from './TurnTransition';
import ActionFeedback, { ActionFeedbackData } from './ActionFeedback';
import PlayerActionIndicator from './PlayerActionIndicator';
import { Church, Building2, Coins, MapPin, RotateCcw, ArrowRight, Users } from 'lucide-react';
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
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedbackData | null>(null);
  const [privateMode, setPrivateMode] = useState(false);
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
  const nextPlayer = gameState.players[(gameState.currentPlayerIndex + 1) % gameState.players.length];
  const currentLocation = gameState.locations[currentPlayer?.position] || null;
  
  const canBuyLand = currentLocation && !currentLocation.owner && currentLocation.type === 'city' && currentPlayer?.money >= currentLocation.price;
  const canBuildOnCurrentLocation = currentLocation && currentLocation.owner === currentPlayer?.id && currentLocation.type === 'city';
  const hasAlreadyPaidRent = currentLocation ? gameState.rentPaidThisTurn[currentLocation.id] || false : false;
  const needsToPayRent = currentLocation && currentLocation.owner && currentLocation.owner !== currentPlayer?.id && currentLocation.rent > 0 && !hasAlreadyPaidRent;

  // Helper function to show action feedback
  const showActionFeedback = (feedback: ActionFeedbackData) => {
    setActionFeedback(feedback);
  };

  // Determine current player action state
  const getPlayerActionState = () => {
    if (gameState.isRolling) return 'rolling';
    if (gameState.isAIThinking) return 'thinking';
    return null;
  };

  const handleLocationClick = (location: GameLocation) => {
    setSelectedLocation(location);
  };

  const handleBuyLand = () => {
    if (currentLocation && onBuyLand && currentPlayer?.id) {
      onBuyLand(currentPlayer.id, currentLocation.id);
      showActionFeedback({
        type: 'success',
        action: 'buy_land',
        title: 'Land Purchased!',
        description: `You bought ${currentLocation.name}`,
        amount: -currentLocation.price,
        location: currentLocation.name,
      });
    }
  };

  const handleBuildChurch = () => {
    if (currentLocation && onBuildChurch && currentPlayer?.id) {
      onBuildChurch(currentPlayer.id, currentLocation.id);
      showActionFeedback({
        type: 'success',
        action: 'build_church',
        title: 'Church Built!',
        description: `Built a church on ${currentLocation.name}`,
        amount: -currentLocation.churchCost,
        location: currentLocation.name,
      });
    }
  };

  const handleBuildSynagogue = () => {
    if (currentLocation && onBuildSynagogue && currentPlayer?.id) {
      onBuildSynagogue(currentPlayer.id, currentLocation.id);
      showActionFeedback({
        type: 'success',
        action: 'build_synagogue',
        title: 'Synagogue Built!',
        description: `Built a synagogue on ${currentLocation.name}`,
        amount: -currentLocation.synagogueCost,
        location: currentLocation.name,
      });
    }
  };

  const handlePayRent = () => {
    if (currentLocation && onPayRent && currentPlayer?.id) {
      const owner = gameState.players.find(p => p.id === currentLocation.owner);
      onPayRent(currentPlayer.id, currentLocation.id);
      showActionFeedback({
        type: 'info',
        action: 'pay_rent',
        title: 'Rent Paid',
        description: `Paid rent to ${owner?.name || 'Unknown'} for ${currentLocation.name}`,
        amount: -currentLocation.rent,
        location: currentLocation.name,
      });
    }
  };

  const handleEndTurn = () => {
    setShowTurnTransition(true);
    onEndTurn();
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Particle Background */}
      <div className="particle-bg" />
      
      <div className="relative z-10 p-2 md:p-4">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          
          {/* Enhanced Game Header */}
          <div className="game-header rounded-2xl p-4 md:p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center flex-1">
                <h1 className="text-xl md:text-3xl font-bold text-primary ancient-title mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Paul's Missionary Journeys
                </h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <p className="text-sm md:text-base text-accent font-medium">
                    Round {gameState.round} • {gameState.players.length} Players
                  </p>
                </div>
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
                <Button onClick={onResetGame} variant="outline" size="sm" className="hover:scale-105 transition-all duration-200">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {isMobile ? 'Reset' : 'Reset Game'}
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Current Player Turn Banner */}
          <div className="current-player-banner rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-accent player-avatar-active flex items-center justify-center overflow-hidden bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm">
                    {currentPlayer?.character?.avatar_face ? (
                      typeof currentPlayer.character.avatar_face === "string" &&
                      currentPlayer.character.avatar_face.endsWith(".png") ? (
                        <img
                          src={currentPlayer.character.avatar_face}
                          alt={currentPlayer.character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg md:text-xl">{currentPlayer.character.avatar_face}</span>
                      )
                    ) : (
                      <span className="text-lg md:text-xl">👤</span>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse border-2 border-background" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg md:text-xl text-accent ancient-text mb-1">
                    {currentPlayer?.name || 'Unknown Player'}'s Turn
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="money-display px-3 py-1 rounded-full">
                      <span className="text-sm md:text-base font-semibold text-accent flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {currentPlayer ? currentPlayer.money : 0} denarii
                      </span>
                    </div>
                    <PlayerActionIndicator 
                      player={currentPlayer}
                      action={getPlayerActionState()}
                      isCurrentPlayer={true}
                      showPrivateMode={privateMode}
                      onTogglePrivateMode={() => setPrivateMode(!privateMode)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              
              {/* Enhanced Mobile Control Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Enhanced Dice */}
                <div className="order-1">
                  <div className="game-card-enhanced rounded-2xl p-4">
                    <Dice
                      dice1={gameState.dice1}
                      dice2={gameState.dice2}
                      isRolling={gameState.isRolling}
                      onRoll={onRollDice}
                    />
                  </div>
                </div>

                {/* Enhanced Current Location Info */}
                <div className="location-info-card rounded-2xl p-4 order-2">
                  <h3 className="font-bold text-primary ancient-text mb-3 flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Current Location
                  </h3>
                  <div className="space-y-3">
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
                      <div className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full inline-block">
                        Owned by: {gameState.players.find(p => p.id === currentLocation.owner)?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Mobile Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                {onSpeedChange && (
                  <div className="floating-ui rounded-xl p-3">
                    <GameSpeedControls
                      speed={currentSpeed}
                      onChange={onSpeedChange}
                      className="w-full justify-center"
                    />
                  </div>
                )}
                
                {(needsToPayRent || hasAlreadyPaidRent) && (
                  <Button 
                    onClick={handlePayRent}
                    className={`action-button w-full text-sm h-12 rounded-xl ${hasAlreadyPaidRent ? 'opacity-50' : ''}`}
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
                    className="action-button w-full text-sm h-12 rounded-xl"
                    variant="default"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Buy Land ({currentLocation?.price} denarii)
                  </Button>
                )}
                
                {canBuildOnCurrentLocation && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleBuildChurch}
                      className="action-button w-full text-xs h-12 rounded-xl"
                      variant="outline"
                      disabled={currentPlayer.money < (currentLocation?.churchCost || 0)}
                    >
                      <Church className="w-3 h-3 mr-1" />
                      Church ({currentLocation?.churchCost})
                    </Button>
                    <Button 
                      onClick={handleBuildSynagogue}
                      className="action-button w-full text-xs h-12 rounded-xl"
                      variant="outline"
                      disabled={currentPlayer.money < (currentLocation?.synagogueCost || 0)}
                    >
                      <Building2 className="w-3 h-3 mr-1" />
                      Synagogue ({currentLocation?.synagogueCost})
                    </Button>
                  </div>
                )}
                
                {/* Enhanced End Turn Button */}
                <Button 
                  onClick={handleEndTurn}
                  className="action-button w-full text-sm h-12 rounded-xl bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent"
                  variant="secondary"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  End Turn
                </Button>
              </div>
            </div>
          ) : (
            /* Enhanced Desktop Layout */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Game Board and Journey Log - Large Center Area */}
              <div className="lg:col-span-3 space-y-6">
                <div className="game-card-enhanced rounded-2xl p-4">
                  <GameBoard 
                    locations={gameState.locations}
                    players={gameState.players}
                    onLocationClick={handleLocationClick}
                    gameLog={gameState.gameLog}
                  />
                </div>
              </div>

              {/* Enhanced Right Sidebar */}
              <div className="space-y-6">
                {/* Enhanced Dice */}
                <div className="game-card-enhanced rounded-2xl p-4">
                  <Dice
                    dice1={gameState.dice1}
                    dice2={gameState.dice2}
                    isRolling={gameState.isRolling}
                    onRoll={onRollDice}
                  />
                </div>

                {/* Enhanced Current Location Info */}
                <div className="location-info-card rounded-2xl p-4">
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
                      <div className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full inline-block">
                        Owned by: {gameState.players.find(p => p.id === currentLocation.owner)?.name}
                      </div>
                    )}
                    
                    {/* Enhanced Action Buttons */}
                    <div className="space-y-3">
                      {(needsToPayRent || hasAlreadyPaidRent) && (
                        <Button 
                          onClick={handlePayRent}
                          className={`action-button w-full text-sm rounded-xl ${hasAlreadyPaidRent ? 'opacity-50' : ''}`}
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
                          className="action-button w-full text-sm rounded-xl"
                          variant="default"
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          Buy Land ({currentLocation.price} denarii)
                        </Button>
                      )}
                      
                      {canBuildOnCurrentLocation && (
                        <div className="grid grid-cols-1 gap-2">
                          <Button 
                            onClick={handleBuildChurch}
                            className="action-button w-full text-xs rounded-xl"
                            variant="outline"
                            disabled={currentPlayer.money < (currentLocation.churchCost || 0)}
                          >
                            <Church className="w-3 h-3 mr-1" />
                            Church ({currentLocation.churchCost})
                          </Button>
                          <Button 
                            onClick={handleBuildSynagogue}
                            className="action-button w-full text-xs rounded-xl"
                            variant="outline"
                            disabled={currentPlayer.money < (currentLocation.synagogueCost || 0)}
                          >
                            <Building2 className="w-3 h-3 mr-1" />
                            Synagogue ({currentLocation.synagogueCost})
                          </Button>
                        </div>
                      )}
                      
                      {/* Enhanced End Turn Button */}
                      <Button 
                        onClick={handleEndTurn}
                        className="action-button w-full text-sm rounded-xl bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent"
                        variant="secondary"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        End Turn
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Player Order Panel */}
                <div className="floating-ui rounded-2xl p-4">
                  <PlayerOrderPanel 
                    players={gameState.players}
                    currentPlayerIndex={gameState.currentPlayerIndex}
                  />
                </div>

                {/* Enhanced Player Stats Panel */}
                <div className="floating-ui rounded-2xl p-4">
                  <PlayerStatsPanel 
                    players={gameState.players}
                    locations={gameState.locations}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Player Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary ancient-text flex items-center">
              <Users className="w-5 h-5 mr-2" />
              All Players
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gameState.players.map((player, index) => (
                <div key={player.id} className="game-card-enhanced rounded-xl animate-fade-in">
                  <PlayerCard
                    player={player}
                    isCurrentPlayer={index === gameState.currentPlayerIndex}
                    canBuild={canBuildOnCurrentLocation && index === gameState.currentPlayerIndex}
                    onBuildChurch={() => handleBuildChurch()}
                    onBuildSynagogue={() => handleBuildSynagogue()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Game Components */}
      <TurnTransition
        currentPlayer={currentPlayer}
        nextPlayer={nextPlayer}
        isVisible={showTurnTransition}
        onComplete={() => setShowTurnTransition(false)}
        speed={currentSpeed.animationsEnabled ? currentSpeed.playerMoveSpeed : 0}
      />
      
      <ActionFeedback
        feedback={actionFeedback}
        onComplete={() => setActionFeedback(null)}
      />

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
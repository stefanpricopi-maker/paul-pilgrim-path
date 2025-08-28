import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Card as UICard } from '@/components/ui/card';
import { useGameDatabase } from '@/hooks/useGameDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import GameBoard from './GameBoard';
import WinModal from './WinModal';
import Dice from './Dice';
import PlayerCard from './PlayerCard';
import PlayerOrderPanel from './PlayerOrderPanel';
import PlayerStatsPanel from './PlayerStatsPanel';
import PropertyActions from './PropertyActions';
import { toast } from 'sonner';
import { GAME_LOCATIONS } from '@/data/locations';
import { MapPin, ArrowRight } from 'lucide-react';

interface OnlineGameBoardProps {
  gameId: string;
}

export default function OnlineGameBoard({ gameId }: OnlineGameBoardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    gameState,
    loading,
    rollDice,
    endTurn,
    buyLand,
    loadGame
  } = useGameDatabase();

  const [showWinModal, setShowWinModal] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [winReason, setWinReason] = useState('');
  
  // Animation state
  const [animatingPlayer, setAnimatingPlayer] = useState<string | undefined>(undefined);
  const [targetPosition, setTargetPosition] = useState<number | undefined>(undefined);
  const [previousPositions, setPreviousPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (gameId && user) {
      loadGame(gameId);
    }
  }, [gameId, user, loadGame]);

  // Check for win condition
  useEffect(() => {
    if (gameState && gameState.players.length > 0) {
      // Simple win condition check - can be expanded based on game settings
      const richestPlayer = gameState.players.reduce((prev, current) => 
        (prev.coins > current.coins) ? prev : current
      );
      
      // Example win condition: first to 5000 coins
      if (richestPlayer.coins >= 5000 && !showWinModal) {
        setWinner(richestPlayer);
        setWinReason(`${richestPlayer.name} won by reaching 5000 coins!`);
        setShowWinModal(true);
      }
    }
  }, [gameState, showWinModal]);

  // Track player position changes for animations
  useEffect(() => {
    if (gameState && gameState.players.length > 0) {
      gameState.players.forEach(player => {
        const prevPosition = previousPositions[player.id];
        if (prevPosition !== undefined && prevPosition !== player.position) {
          // Player moved, trigger animation
          setAnimatingPlayer(player.id);
          setTargetPosition(player.position);
        }
      });
      
      // Update previous positions
      const newPositions: Record<string, number> = {};
      gameState.players.forEach(player => {
        newPositions[player.id] = player.position;
      });
      setPreviousPositions(newPositions);
    }
  }, [gameState?.players, previousPositions]);

  const handleAnimationComplete = () => {
    setAnimatingPlayer(undefined);
    setTargetPosition(undefined);
  };

  const handleLocationClick = (location: any) => {
    // Handle location click logic here
    console.log('Location clicked:', location);
  };

  const handlePlayAgain = () => {
    setShowWinModal(false);
    navigate('/');
  };

  const handleClose = () => {
    setShowWinModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⛪</div>
          <h1 className="text-xl font-bold text-primary mb-2">Loading game...</h1>
        </div>
      </div>
    );
  }

  if (!gameState || !gameState.game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-destructive mb-4">Game not found</h1>
          <p className="text-muted-foreground mb-4">The game you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/')}>Return to Menu</Button>
        </Card>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex] || gameState.players[0];
  const currentLocation = GAME_LOCATIONS[currentPlayer?.position] || null;
  const isMyTurn = gameState.isMyTurn;

  console.log('OnlineGameBoard state:', {
    gameStateIsMyTurn: gameState.isMyTurn,
    currentPlayerIndex: gameState.currentPlayerIndex,
    currentPlayerUserId: currentPlayer?.user_id,
    userUserId: user?.id,
    playersLength: gameState.players.length,
    hasCurrentPlayer: !!currentPlayer
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">Online Game</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Leave Game
          </Button>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          {/* Game Board */}
          <div className="xl:col-span-3">
            <GameBoard
              locations={GAME_LOCATIONS}
              players={gameState.players.map(p => ({
                id: p.id,
                name: p.name,
                position: p.position,
                money: p.coins,
                character: { name: p.character_name || 'Unknown', description: '', specialAbility: '', avatar: '' },
                properties: [],
                propertyVisits: { [p.position]: 5 }, // Give default visits to allow building
                color: '#3B82F6',
                inJail: p.in_jail,
                jailTurns: p.jail_turns,
                hasGetOutOfJailCard: p.has_get_out_of_jail_card,
                immunityUntil: p.immunity_until,
                skipNextTurn: p.skip_next_turn || false,
                consecutiveDoubles: p.consecutive_doubles || 0,
                hasRolled: false
              }))}
              onLocationClick={handleLocationClick}
              animatingPlayer={animatingPlayer}
              targetPosition={targetPosition}
              onAnimationComplete={handleAnimationComplete}
              gameLog={gameState.gameLog.map(log => log.description || 'Game event')}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Dice */}
            <Dice
              dice1={gameState.dice1}
              dice2={gameState.dice2}
              isRolling={gameState.isRolling}
              onRoll={rollDice}
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
                  {/* End Turn Button - only show for current player */}
                  {isMyTurn && (
                    <Button 
                      onClick={endTurn}
                      className="w-full text-sm"
                      variant="secondary"
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      End Turn
                    </Button>
                  )}
                  
                  {!isMyTurn && (
                    <p className="text-sm text-muted-foreground text-center">
                      Waiting for {currentPlayer?.name}'s turn...
                    </p>
                  )}
                </div>
              </div>
            </UICard>

            {/* Property Actions */}
            {currentLocation && isMyTurn && currentLocation.type === 'city' && (
              <PropertyActions
                location={currentLocation}
                currentPlayer={{
                  id: currentPlayer.id,
                  name: currentPlayer.name,
                  money: currentPlayer.coins,
                  position: currentPlayer.position,
                  character: { name: currentPlayer.character_name || 'Unknown', description: '', specialAbility: '', avatar: '' },
                  properties: [],
                  propertyVisits: { [currentPlayer.position]: 5 },
                  color: '#3B82F6',
                  inJail: currentPlayer.in_jail,
                  jailTurns: currentPlayer.jail_turns,
                  hasGetOutOfJailCard: currentPlayer.has_get_out_of_jail_card,
                  immunityUntil: currentPlayer.immunity_until,
                  skipNextTurn: currentPlayer.skip_next_turn || false,
                  consecutiveDoubles: currentPlayer.consecutive_doubles || 0,
                  hasRolled: false
                }}
                onBuyLand={buyLand}
                onBuildChurch={() => toast.info('Build church functionality coming soon!')}
                onBuildSynagogue={() => toast.info('Build synagogue functionality coming soon!')}
                onPayRent={() => toast.info('Pay rent functionality coming soon!')}
                onEndTurn={endTurn}
                isCurrentPlayerLocation={true}
                allPlayers={gameState.players.map(p => ({
                  id: p.id,
                  name: p.name,
                  money: p.coins,
                  position: p.position,
                  character: { name: p.character_name || 'Unknown', description: '', specialAbility: '', avatar: '' },
                  properties: [],
                  propertyVisits: {},
                  color: '#3B82F6',
                  inJail: p.in_jail,
                  jailTurns: p.jail_turns,
                  hasGetOutOfJailCard: p.has_get_out_of_jail_card,
                  immunityUntil: p.immunity_until,
                  skipNextTurn: p.skip_next_turn || false,
                  consecutiveDoubles: p.consecutive_doubles || 0,
                  hasRolled: false
                }))}
                rentPaidThisTurn={{}}
              />
            )}

            {/* Player Order Panel */}
            <PlayerOrderPanel 
              players={gameState.players.map(p => ({
                id: p.id,
                name: p.name,
                position: p.position,
                money: p.coins,
                character: { name: p.character_name || 'Unknown', description: '', specialAbility: '', avatar: '' },
                properties: [],
                propertyVisits: {},
                color: '#3B82F6',
                inJail: p.in_jail,
                jailTurns: p.jail_turns,
                hasGetOutOfJailCard: p.has_get_out_of_jail_card,
                immunityUntil: p.immunity_until,
                skipNextTurn: p.skip_next_turn || false,
                consecutiveDoubles: p.consecutive_doubles || 0,
                hasRolled: false
              }))}
              currentPlayerIndex={gameState.currentPlayerIndex}
            />

            {/* Player Statistics Panel */}
            <PlayerStatsPanel 
              players={gameState.players.map(p => ({
                id: p.id,
                name: p.name,
                position: p.position,
                money: p.coins,
                character: { name: p.character_name || 'Unknown', description: '', specialAbility: '', avatar: '' },
                properties: [],
                propertyVisits: {},
                color: '#3B82F6',
                inJail: p.in_jail,
                jailTurns: p.jail_turns,
                hasGetOutOfJailCard: p.has_get_out_of_jail_card,
                immunityUntil: p.immunity_until,
                skipNextTurn: p.skip_next_turn || false,
                consecutiveDoubles: p.consecutive_doubles || 0,
                hasRolled: false
              }))}
              locations={GAME_LOCATIONS}
            />
          </div>
        </div>

        {/* Players Panel - Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {gameState.players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={{
                id: player.id,
                name: player.name,
                position: player.position,
                money: player.coins,
                character: { name: player.character_name || 'Unknown', description: '', specialAbility: '', avatar: '' },
                properties: [],
                propertyVisits: {},
                color: '#3B82F6',
                inJail: player.in_jail,
                jailTurns: player.jail_turns,
                hasGetOutOfJailCard: player.has_get_out_of_jail_card,
                immunityUntil: player.immunity_until,
                skipNextTurn: player.skip_next_turn || false,
                consecutiveDoubles: player.consecutive_doubles || 0,
                hasRolled: false
              }}
              isCurrentPlayer={index === gameState.currentPlayerIndex}
              canBuild={false}
              onBuildChurch={() => {/* Handled via current location actions */}}
              onBuildSynagogue={() => {/* Handled via current location actions */}}
            />
          ))}
        </div>

        {showWinModal && winner && (
          <WinModal
            isOpen={showWinModal}
            winner={winner}
            reason={winReason}
            onPlayAgain={handlePlayAgain}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
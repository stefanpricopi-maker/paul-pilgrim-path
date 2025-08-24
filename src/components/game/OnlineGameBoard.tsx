import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Dice from './Dice';
import GameBoard from './GameBoard';
import PlayerStatsPanel from './PlayerStatsPanel';
import { useGameDatabase } from '@/hooks/useGameDatabase';
import { useAuth } from '@/hooks/useAuth';
import { BIBLICAL_CHARACTERS, Player } from '@/types/game';
import { Users, Crown, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OnlineGameBoardProps {
  gameId: string;
}

const OnlineGameBoard = ({ gameId }: OnlineGameBoardProps) => {
  const { user } = useAuth();
  const { gameState, loading, loadGame, rollDice, endTurn, getGameLocations } = useGameDatabase();
  const [animatingPlayer, setAnimatingPlayer] = useState<string>();
  const [targetPosition, setTargetPosition] = useState<number>();

  useEffect(() => {
    if (gameId) {
      loadGame(gameId);
    }
  }, [gameId, loadGame]);

  const handleLocationClick = (location: any) => {
    // TODO: Implement property actions for multiplayer
    console.log('Location clicked:', location);
  };

  const handleRollDice = () => {
    if (!gameState.isMyTurn || gameState.isRolling) return;
    rollDice();
  };

  const handleEndTurn = () => {
    if (!gameState.isMyTurn || gameState.diceValue === 0) return;
    endTurn();
  };

  const handleAnimationComplete = () => {
    setAnimatingPlayer(undefined);
    setTargetPosition(undefined);
  };

  const getCurrentPlayer = () => {
    return gameState.players[gameState.currentPlayerIndex];
  };

  const getPlayerCharacter = (characterName: string | null) => {
    return BIBLICAL_CHARACTERS.find(c => c.name === characterName) || BIBLICAL_CHARACTERS[0];
  };

  if (loading || !gameState.game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 bg-gradient-parchment shadow-ancient border-2 border-accent/30">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">⛪</div>
            <h1 className="text-3xl font-bold text-primary ancient-text mb-2">
              Waiting for Journey to Begin
            </h1>
            <p className="text-muted-foreground">
              The host will start the game when all players are ready
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Players:</span>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {gameState.players.length}/6
              </div>
            </div>

            {gameState.players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-background rounded">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {getPlayerCharacter(player.character_name).avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.character_name}</p>
                  </div>
                </div>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Host
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const gameLocations = getGameLocations();
  const gameLogStrings = gameState.gameLog.map(log => log.description || '');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Game Header */}
        <Card className="p-4 bg-gradient-parchment border-2 border-accent/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">✝️</div>
              <div>
                <h1 className="text-2xl font-bold text-primary ancient-text">
                  Paul's Missionary Journeys
                </h1>
                <p className="text-sm text-muted-foreground">
                  Game ID: {gameState.game.id.substring(0, 8)}...
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Current Turn</div>
              <div className="font-bold text-primary">
                {currentPlayer?.name || 'Unknown'}
              </div>
              {gameState.isMyTurn && (
                <Badge variant="default" className="mt-1">Your Turn</Badge>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Board */}
          <div className="lg:col-span-3">
            <GameBoard
              locations={gameLocations}
              players={gameState.players.map(p => ({
                id: p.id,
                name: p.name,
                character: getPlayerCharacter(p.character_name),
                position: p.position,
                money: p.coins,
                properties: [], // TODO: Load from tiles
                propertyVisits: {},
                color: '#3b82f6', // TODO: Assign colors
                inJail: p.in_jail,
                jailTurns: p.jail_turns,
                hasGetOutOfJailCard: p.has_get_out_of_jail_card,
                immunityUntil: p.immunity_until,
                skipNextTurn: p.skip_next_turn || false,
                consecutiveDoubles: p.consecutive_doubles || 0,
                hasRolled: false
              } as Player))}
              onLocationClick={handleLocationClick}
              animatingPlayer={animatingPlayer}
              targetPosition={targetPosition}
              onAnimationComplete={handleAnimationComplete}
              gameLog={gameLogStrings}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            
            {/* Player Stats */}
            <PlayerStatsPanel 
              players={gameState.players.map(p => ({
                id: p.id,
                name: p.name,
                character: getPlayerCharacter(p.character_name),
                position: p.position,
                money: p.coins,
                properties: [], // TODO: Load from tiles
                propertyVisits: {},
                color: '#3b82f6', // TODO: Assign colors
                inJail: p.in_jail,
                jailTurns: p.jail_turns,
                hasGetOutOfJailCard: p.has_get_out_of_jail_card,
                immunityUntil: p.immunity_until,
                skipNextTurn: p.skip_next_turn || false,
                consecutiveDoubles: p.consecutive_doubles || 0,
                hasRolled: false
              } as Player))}
              locations={gameLocations}
            />

            {/* Dice Controls */}
            {gameState.isMyTurn && (
              <Card className="p-4 bg-gradient-parchment border-2 border-accent/30">
                <h3 className="font-bold text-primary ancient-text mb-4 text-center">
                  Your Turn
                </h3>
                
                <div className="space-y-4">
                  <Dice
                    dice1={gameState.dice1}
                    dice2={gameState.dice2}
                    isRolling={gameState.isRolling}
                    onRoll={handleRollDice}
                  />
                  
                  {gameState.diceValue > 0 && (
                    <Button 
                      onClick={handleEndTurn}
                      className="w-full ancient-text"
                      variant="outline"
                    >
                      End Turn
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {!gameState.isMyTurn && (
              <Card className="p-4 bg-card/50 border-2 border-muted">
                <div className="text-center">
                  <div className="text-2xl mb-2">⏳</div>
                  <p className="text-sm text-muted-foreground">
                    Waiting for {currentPlayer?.name}'s turn...
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineGameBoard;
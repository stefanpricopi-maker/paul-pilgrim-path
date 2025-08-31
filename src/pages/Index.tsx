import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LanguageSelector } from '@/components/ui/language-selector';
import GameLobby from '@/components/game/GameLobby';
import OnlineGameBoard from '@/components/game/OnlineGameBoard';
import GameModeSelector from '@/components/game/GameModeSelector';
import LocalGameSetup from '@/components/game/LocalGameSetup';
import LocalGameBoard from '@/components/game/LocalGameBoard';
import WinModal from '@/components/game/WinModal';
import { useGameDatabase } from '@/hooks/useGameDatabase';
import { useLocalGame } from '@/hooks/useLocalGame';
import { useAuth } from '@/hooks/useAuth';
import { GameLocation } from '@/types/game';
import { BIBLICAL_CHARACTERS } from '@/types/game';
import { Church, Building2, Coins, MapPin, LogOut, User } from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();
  const [gameMode, setGameMode] = useState<'online' | 'local' | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GameLocation | null>(null);
  const [gameSettings, setGameSettings] = useState<any>(null);
  const [winner, setWinner] = useState<{ player: any; reason: string } | null>(null);

  // Online game state
  const { 
    gameState: onlineGameState,
    loading,
    createGame,
    joinGame,
    startGame,
    rollDice: onlineRollDice,
    endTurn: onlineEndTurn,
    tryReconnectToStoredGame,
    clearStoredGameId,
    getStoredGameId,
    leaveGame
  } = useGameDatabase();
  
  // Local game state
  const {
    gameState: localGameState,
    createLocalGame,
    loadLocalGame,
    rollDice: localRollDice,
    endTurn: localEndTurn,
    resetGame,
    buyLand,
    buildChurch,
    buildSynagogue,
    payRent,
    handleCardAction,
    checkWinCondition,
  } = useLocalGame();
  
  const { user, signOut } = useAuth();

  // Check if we have a saved local game
  const hasExistingLocalGame = localStorage.getItem('localGameState') !== null;

  // Try to reconnect to stored online game on component mount
  useEffect(() => {
    if (user && !gameMode && !onlineGameState.game) {
      tryReconnectToStoredGame().then((reconnected) => {
        if (reconnected) {
          setGameMode('online');
        }
      });
    }
  }, [user, gameMode, onlineGameState.game, tryReconnectToStoredGame]);

  // Check for win condition after each turn
  useEffect(() => {
    if (localGameState.gameStarted && localGameState.players.length > 1) {
      const winResult = checkWinCondition(localGameState, gameSettings);
      if (winResult.hasWinner && winResult.winner) {
        setWinner({ player: winResult.winner, reason: winResult.reason || 'Game completed' });
      }
    }
  }, [localGameState, gameSettings, checkWinCondition]);

  // Show game mode selector if no mode selected
  if (!gameMode) {
    return (
      <div className="space-y-4">
        <GameModeSelector onSelectMode={setGameMode} />
        {user && getStoredGameId() && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              You have an online game in progress
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                tryReconnectToStoredGame().then((reconnected) => {
                  if (reconnected) {
                    setGameMode('online');
                  }
                });
              }}
            >
              Return to Game
            </Button>
          </div>
        )}
      </div>
    );
  }


  // Local game flow
  if (gameMode === 'local') {
    if (!localGameState.gameStarted) {
      return (
        <LocalGameSetup
          onStartGame={(playerNames, colors, settings) => {
            setGameSettings(settings);
            createLocalGame(playerNames, colors, settings);
          }}
          onLoadGame={loadLocalGame}
          hasExistingGame={hasExistingLocalGame}
        />
      );
    }

    return (
      <>
        <LocalGameBoard
          gameState={localGameState}
          onRollDice={localRollDice}
          onEndTurn={localEndTurn}
          onResetGame={() => {
            resetGame();
            setWinner(null);
            setGameSettings(null);
          }}
          onBuyLand={buyLand}
          onBuildChurch={buildChurch}
          onBuildSynagogue={buildSynagogue}
          onPayRent={payRent}
          onCardAction={handleCardAction}
        />
        
        {winner && (
          <WinModal
            isOpen={true}
            winner={winner.player}
            reason={winner.reason}
            onPlayAgain={() => {
              resetGame();
              setWinner(null);
              setGameSettings(null);
              setGameMode(null);
            }}
            onClose={() => {
              setWinner(null);
            }}
          />
        )}
      </>
    );
  }

  // Online game flow
  if (!onlineGameState.game || !onlineGameState.gameStarted) {
    return (
      <GameLobby
        gameState={onlineGameState}
        loading={loading}
        onCreateGame={createGame}
        onJoinGame={joinGame}
        onStartGame={startGame}
        onLeaveGame={() => {
          clearStoredGameId();
          setGameMode(null);
        }}
      />
    );
  }

  // Show online game board
  return <OnlineGameBoard gameId={onlineGameState.game.id} />;
};

export default Index;

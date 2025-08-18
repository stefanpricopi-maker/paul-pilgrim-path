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
    endTurn: onlineEndTurn
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
    return <GameModeSelector onSelectMode={setGameMode} />;
  }

  // If online mode but loading and no game, show loading with option to go back
  if (gameMode === 'online' && loading && !onlineGameState.game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="text-4xl mb-4">⛪</div>
          <h1 className="text-2xl font-bold text-primary mb-4">Loading your missionary journey...</h1>
          <p className="text-muted-foreground mb-6">Setting up the game environment</p>
          <Button 
            onClick={() => setGameMode(null)} 
            variant="outline"
          >
            Back to Game Mode Selection
          </Button>
        </Card>
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
      />
    );
  }

  // Show online game board
  return <OnlineGameBoard gameId={onlineGameState.game.id} />;
};

export default Index;

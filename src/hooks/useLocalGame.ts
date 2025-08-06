import { useState, useCallback } from 'react';
import { Player, GameLocation } from '@/types/game';
import { BIBLICAL_CHARACTERS } from '@/types/game';
import { GAME_LOCATIONS } from '@/data/locations';

interface LocalGameState {
  players: Player[];
  currentPlayerIndex: number;
  locations: GameLocation[];
  gameStarted: boolean;
  diceValue: number;
  isRolling: boolean;
  gameLog: string[];
  round: number;
}

export const useLocalGame = () => {
  const [gameState, setGameState] = useState<LocalGameState>({
    players: [],
    currentPlayerIndex: 0,
    locations: GAME_LOCATIONS,
    gameStarted: false,
    diceValue: 0,
    isRolling: false,
    gameLog: [],
    round: 1,
  });

  const [currentPlayerPrivate, setCurrentPlayerPrivate] = useState(true);

  // Create local game with players
  const createLocalGame = useCallback((playerNames: string[], playerColors: string[]) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `local-${index}`,
      name,
      character: BIBLICAL_CHARACTERS[index % BIBLICAL_CHARACTERS.length],
      position: 0,
      money: 1000,
      properties: [],
      color: playerColors[index] || `hsl(var(--player-${(index % 6) + 1}))`,
    }));

    setGameState(prev => ({
      ...prev,
      players,
      gameStarted: true,
      gameLog: [`Game started with ${players.length} players!`],
    }));

    // Save to localStorage
    localStorage.setItem('localGameState', JSON.stringify({
      players,
      currentPlayerIndex: 0,
      gameStarted: true,
      round: 1,
    }));
  }, []);

  // Load saved local game
  const loadLocalGame = useCallback(() => {
    const saved = localStorage.getItem('localGameState');
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        setGameState(prev => ({
          ...prev,
          ...savedState,
          locations: GAME_LOCATIONS,
          diceValue: 0,
          isRolling: false,
          gameLog: savedState.gameLog || [],
        }));
        return true;
      } catch (error) {
        console.error('Failed to load saved game:', error);
      }
    }
    return false;
  }, []);

  // Roll dice
  const rollDice = useCallback(() => {
    if (gameState.isRolling) return;

    setGameState(prev => ({ ...prev, isRolling: true }));

    // Simulate dice animation
    const rollAnimation = setInterval(() => {
      setGameState(prev => ({ ...prev, diceValue: Math.floor(Math.random() * 6) + 1 }));
    }, 100);

    setTimeout(() => {
      clearInterval(rollAnimation);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      
      setGameState(prev => {
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const newPosition = (currentPlayer.position + finalValue) % prev.locations.length;
        
        const updatedPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { ...player, position: newPosition }
            : player
        );

        const logEntry = `${currentPlayer.name} rolled ${finalValue} and moved to ${prev.locations[newPosition].name}`;
        
        return {
          ...prev,
          diceValue: finalValue,
          isRolling: false,
          players: updatedPlayers,
          gameLog: [...prev.gameLog, logEntry].slice(-10), // Keep only last 10 entries
        };
      });
    }, 1500);
  }, [gameState.isRolling]);

  // End turn
  const endTurn = useCallback(() => {
    setGameState(prev => {
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const newRound = nextPlayerIndex === 0 ? prev.round + 1 : prev.round;
      
      const newState = {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: 0,
        round: newRound,
        gameLog: [...prev.gameLog, `${prev.players[nextPlayerIndex].name}'s turn (Round ${newRound})`].slice(-10),
      };

      // Save to localStorage
      localStorage.setItem('localGameState', JSON.stringify({
        players: newState.players,
        currentPlayerIndex: newState.currentPlayerIndex,
        gameStarted: newState.gameStarted,
        round: newState.round,
        gameLog: newState.gameLog,
      }));

      return newState;
    });

    setCurrentPlayerPrivate(true);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      locations: GAME_LOCATIONS,
      gameStarted: false,
      diceValue: 0,
      isRolling: false,
      gameLog: [],
      round: 1,
    });
    localStorage.removeItem('localGameState');
    setCurrentPlayerPrivate(true);
  }, []);

  // Show current player info (for shared device)
  const showCurrentPlayer = useCallback(() => {
    setCurrentPlayerPrivate(false);
  }, []);

  // Hide current player info (for privacy on shared device)
  const hideCurrentPlayer = useCallback(() => {
    setCurrentPlayerPrivate(true);
  }, []);

  return {
    gameState,
    currentPlayerPrivate,
    createLocalGame,
    loadLocalGame,
    rollDice,
    endTurn,
    resetGame,
    showCurrentPlayer,
    hideCurrentPlayer,
  };
};
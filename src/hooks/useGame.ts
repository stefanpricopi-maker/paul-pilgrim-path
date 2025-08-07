import { useState, useCallback } from 'react';
import { GameState, Player, GameLocation } from '@/types/game';
import { GAME_LOCATIONS } from '@/data/locations';
import { toast } from '@/hooks/use-toast';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    locations: GAME_LOCATIONS,
    gameStarted: false,
    diceValue: 0,
    isRolling: false,
    gameLog: []
  });

  const addToLog = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [message, ...prev.gameLog.slice(0, 9)] // Keep last 10 messages
    }));
  }, []);

  const startGame = useCallback((players: Player[]) => {
    setGameState(prev => ({
      ...prev,
      players,
      gameStarted: true,
      currentPlayerIndex: 0
    }));
    addToLog(`Game started with ${players.length} players!`);
    toast({
      title: "Journey Begins!",
      description: "May God bless your missionary efforts.",
    });
  }, [addToLog]);

  const rollDice = useCallback(() => {
    if (gameState.isRolling) return;

    setGameState(prev => ({ ...prev, isRolling: true }));
    
    // Simulate dice roll animation
    setTimeout(() => {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const newPosition = (currentPlayer.position + diceValue) % gameState.locations.length;
      
      setGameState(prev => {
        const newPlayers = [...prev.players];
        newPlayers[prev.currentPlayerIndex] = {
          ...newPlayers[prev.currentPlayerIndex],
          position: newPosition
        };

        const location = prev.locations[newPosition];
        addToLog(`${currentPlayer.name} rolled ${diceValue} and moved to ${location.name}`);

        // Check if player passed GO (completed a full circuit)
        if (currentPlayer.position + diceValue >= prev.locations.length) {
          newPlayers[prev.currentPlayerIndex].money += 200;
          addToLog(`${currentPlayer.name} completed a journey and received 200 denarii!`);
          toast({
            title: "Journey Completed!",
            description: `${currentPlayer.name} received 200 denarii for completing a circuit.`,
          });
        }

        // Handle special tile actions
        if (location.type === 'special' && location.id === 'antiochia') {
          // Bonus for landing on starting point
          newPlayers[prev.currentPlayerIndex].money += 200;
          addToLog(`${currentPlayer.name} receives 200 denarii for landing on Antiochia!`);
        } else if (location.type === 'prison') {
          addToLog(`${currentPlayer.name} is just visiting the prison.`);
        } else if (location.type === 'go-to-prison') {
          // Move player to prison
          const prisonIndex = prev.locations.findIndex(loc => loc.type === 'prison');
          if (prisonIndex !== -1) {
            newPlayers[prev.currentPlayerIndex].position = prisonIndex;
            addToLog(`${currentPlayer.name} goes directly to prison!`);
          }
        } else if (location.type === 'chance') {
          addToLog(`${currentPlayer.name} draws a chance card!`);
          // TODO: Implement chance card logic
        } else if (location.type === 'community-chest') {
          addToLog(`${currentPlayer.name} draws a community chest card!`);
          // TODO: Implement community chest logic
        } else if (location.type === 'court') {
          addToLog(`${currentPlayer.name} rests at the court - free parking!`);
        } else if (location.type === 'sacrifice') {
          // Pay sacrifice tax
          const tax = 100;
          newPlayers[prev.currentPlayerIndex].money = Math.max(0, newPlayers[prev.currentPlayerIndex].money - tax);
          addToLog(`${currentPlayer.name} pays ${tax} denarii in sacrifice tax.`);
        }

        return {
          ...prev,
          players: newPlayers,
          diceValue,
          isRolling: false
        };
      });
    }, 800);
  }, [gameState.isRolling, gameState.players, gameState.currentPlayerIndex, gameState.locations, addToLog]);

  const endTurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
      diceValue: 0
    }));
  }, []);

  const buyProperty = useCallback((locationId: string, skipConfirmation: boolean = false) => {
    const location = gameState.locations.find(loc => loc.id === locationId);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!location || !currentPlayer) return;
    
    if (location.owner) {
      toast({
        title: "Cannot Purchase",
        description: "Property already owned!",
        variant: "destructive"
      });
      return;
    }

    if (currentPlayer.money < location.price) {
      toast({
        title: "Insufficient Funds",
        description: `Need ${location.price} denarii to purchase this property`,
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => {
      const newPlayers = [...prev.players];
      const newLocations = [...prev.locations];
      
      // Update player
      newPlayers[prev.currentPlayerIndex] = {
        ...newPlayers[prev.currentPlayerIndex],
        money: newPlayers[prev.currentPlayerIndex].money - location.price,
        properties: [...newPlayers[prev.currentPlayerIndex].properties, locationId]
      };
      
      // Update location
      const locationIndex = newLocations.findIndex(loc => loc.id === locationId);
      newLocations[locationIndex] = {
        ...newLocations[locationIndex],
        owner: currentPlayer.id
      };

      return {
        ...prev,
        players: newPlayers,
        locations: newLocations
      };
    });

    addToLog(`${currentPlayer.name} purchased ${location.name} for ${location.price} denarii`);
    toast({
      title: "Property Acquired!",
      description: `You now own ${location.name}`,
    });
  }, [gameState.locations, gameState.players, gameState.currentPlayerIndex, addToLog]);

  const buildChurch = useCallback((locationId: string, skipConfirmation: boolean = false) => {
    const location = gameState.locations.find(loc => loc.id === locationId);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!location || !currentPlayer || location.owner !== currentPlayer.id) {
      toast({
        title: "Cannot Build",
        description: "You don't own this property!",
        variant: "destructive"
      });
      return;
    }

    if (location.type !== 'city') {
      toast({
        title: "Cannot Build",
        description: "Churches can only be built in cities!",
        variant: "destructive"
      });
      return;
    }
    
    if (currentPlayer.money < location.churchCost) {
      toast({
        title: "Insufficient Funds",
        description: `Need ${location.churchCost} denarii to build a church`,
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => {
      const newPlayers = [...prev.players];
      const newLocations = [...prev.locations];
      
      // Update player money
      newPlayers[prev.currentPlayerIndex] = {
        ...newPlayers[prev.currentPlayerIndex],
        money: newPlayers[prev.currentPlayerIndex].money - location.churchCost
      };
      
      // Update location with new church
      const locationIndex = newLocations.findIndex(loc => loc.id === locationId);
      newLocations[locationIndex] = {
        ...newLocations[locationIndex],
        buildings: {
          ...newLocations[locationIndex].buildings,
          churches: newLocations[locationIndex].buildings.churches + 1
        }
      };

      return {
        ...prev,
        players: newPlayers,
        locations: newLocations
      };
    });

    addToLog(`${currentPlayer.name} built a church in ${location.name}`);
    toast({
      title: "Church Built!",
      description: `A new church spreads the Gospel in ${location.name}`,
    });
  }, [gameState.locations, gameState.players, gameState.currentPlayerIndex, addToLog]);

  const buildSynagogue = useCallback((locationId: string, skipConfirmation: boolean = false) => {
    const location = gameState.locations.find(loc => loc.id === locationId);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!location || !currentPlayer || location.owner !== currentPlayer.id) {
      toast({
        title: "Cannot Build",
        description: "You don't own this property!",
        variant: "destructive"
      });
      return;
    }

    if (location.type !== 'city') {
      toast({
        title: "Cannot Build",
        description: "Synagogues can only be built in cities!",
        variant: "destructive"
      });
      return;
    }
    
    if (currentPlayer.money < location.synagogueCost) {
      toast({
        title: "Insufficient Funds",
        description: `Need ${location.synagogueCost} denarii to build a synagogue`,
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => {
      const newPlayers = [...prev.players];
      const newLocations = [...prev.locations];
      
      // Update player money
      newPlayers[prev.currentPlayerIndex] = {
        ...newPlayers[prev.currentPlayerIndex],
        money: newPlayers[prev.currentPlayerIndex].money - location.synagogueCost
      };
      
      // Update location with new synagogue
      const locationIndex = newLocations.findIndex(loc => loc.id === locationId);
      newLocations[locationIndex] = {
        ...newLocations[locationIndex],
        buildings: {
          ...newLocations[locationIndex].buildings,
          synagogues: newLocations[locationIndex].buildings.synagogues + 1
        }
      };

      return {
        ...prev,
        players: newPlayers,
        locations: newLocations
      };
    });

    addToLog(`${currentPlayer.name} built a synagogue in ${location.name}`);
    toast({
      title: "Synagogue Built!",
      description: `A new synagogue teaches Scripture in ${location.name}`,
    });
  }, [gameState.locations, gameState.players, gameState.currentPlayerIndex, addToLog]);

  return {
    gameState,
    startGame,
    rollDice,
    endTurn,
    buyProperty,
    buildChurch,
    buildSynagogue
  };
};
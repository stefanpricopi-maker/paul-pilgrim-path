import { useState, useCallback, useEffect } from 'react';
import { Player, GameLocation } from '@/types/game';
import { Card } from '@/types/cards';
import { BIBLICAL_CHARACTERS } from '@/types/game';
import { GAME_LOCATIONS } from '@/data/locations';
import { useCards } from './useCards';
import { useEconomy } from './useEconomy';

interface LocalGameState {
  players: Player[];
  currentPlayerIndex: number;
  locations: GameLocation[];
  gameStarted: boolean;
  diceValue: number;
  isRolling: boolean;
  gameLog: string[];
  round: number;
  drawnCard: Card | null;
  cardType: 'community' | 'chance' | null;
}

export const useLocalGame = () => {
  const { loadCards, drawCommunityCard, drawChanceCard, processCardAction } = useCards();
  const { handlePassStart, handleCardAction: processEconomyAction, applyTransactions } = useEconomy();
  
  const [gameState, setGameState] = useState<LocalGameState>({
    players: [],
    currentPlayerIndex: 0,
    locations: GAME_LOCATIONS,
    gameStarted: false,
    diceValue: 0,
    isRolling: false,
    gameLog: [],
    round: 1,
    drawnCard: null,
    cardType: null,
  });

  const [currentPlayerPrivate, setCurrentPlayerPrivate] = useState(true);

  // Load cards when component mounts
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Create local game with players and settings
  const createLocalGame = useCallback((playerNames: string[], playerColors: string[], settings?: any) => {
    const initialMoney = settings?.initialBalance || 1000;
    
    const players: Player[] = playerNames.map((name, index) => ({
      id: `local-${index}`,
      name,
      character: BIBLICAL_CHARACTERS[index % BIBLICAL_CHARACTERS.length],
      position: 0,
      money: initialMoney,
      properties: [],
      color: playerColors[index] || `hsl(var(--game-player${(index % 6) + 1}))`,
      inJail: false,
      jailTurns: 0,
      hasGetOutOfJailCard: false,
      immunityUntil: 0,
      skipNextTurn: false,
      consecutiveDoubles: 0,
    }));

    setGameState(prev => ({
      ...prev,
      players,
      gameStarted: true,
      gameLog: [`Game started with ${players.length} players!${settings?.debugMode ? ' (Debug Mode)' : ''}`],
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

  // Check for special tile effects
  const handleSpecialTile = useCallback((player: Player, location: GameLocation, diceValue: number) => {
    const transactions = [];
    let specialEffects: Partial<Player> = {};
    
    switch (location.id) {
      case 'prison':
        // TEMNIȚA: If landing here directly, just visiting
        break;
        
      case 'go-to-prison':
        // GO TO PRISON: Send player to jail
        specialEffects = {
          position: 10, // Prison position
          inJail: true,
          jailTurns: 0,
          consecutiveDoubles: 0
        };
        break;
        
      case 'sabat':
        // SABAT: Skip next turn
        specialEffects = { skipNextTurn: true };
        break;
        
      case 'cort':
        // CORT: Add temporary immunity (1 round)
        specialEffects = { immunityUntil: gameState.round + 1 };
        break;
        
      default:
        // Check if it's a PORT for teleport ability
        if (location.type === 'port') {
          // Player can choose to teleport to another port
          // For now, automatically teleport to next available port
          const ports = gameState.locations.filter(loc => loc.type === 'port' && loc.id !== location.id);
          if (ports.length > 0) {
            const randomPort = ports[Math.floor(Math.random() * ports.length)];
            const portIndex = gameState.locations.findIndex(loc => loc.id === randomPort.id);
            if (portIndex !== -1) {
              specialEffects = { position: portIndex };
            }
          }
        }
        break;
    }
    
    return { transactions, specialEffects };
  }, [gameState.round, gameState.locations]);

  // Handle jail mechanics
  const handleJailLogic = useCallback((player: Player, diceValue: number) => {
    if (!player.inJail) return { canMove: true, effects: {} };
    
    // Check if player has been in jail for 3 turns
    if (player.jailTurns >= 3) {
      return {
        canMove: true,
        effects: {
          inJail: false,
          jailTurns: 0
        }
      };
    }
    
    // Check for doubles to get out of jail
    // For simplicity, we'll use a random chance here
    const isDouble = Math.random() < 0.16; // ~1/6 chance like rolling doubles
    
    if (isDouble || player.hasGetOutOfJailCard) {
      return {
        canMove: true,
        effects: {
          inJail: false,
          jailTurns: 0,
          hasGetOutOfJailCard: player.hasGetOutOfJailCard ? false : player.hasGetOutOfJailCard
        }
      };
    }
    
    // Remain in jail
    return {
      canMove: false,
      effects: {
        jailTurns: player.jailTurns + 1
      }
    };
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
        
        // Check if player should skip turn
        if (currentPlayer.skipNextTurn) {
          const updatedPlayers = prev.players.map((player, index) => 
            index === prev.currentPlayerIndex 
              ? { ...player, skipNextTurn: false }
              : player
          );
          
          return {
            ...prev,
            players: updatedPlayers,
            diceValue: finalValue,
            isRolling: false,
            gameLog: [...prev.gameLog, `${currentPlayer.name} skipped their turn due to SABAT`].slice(-10)
          };
        }
        
        // Handle jail logic
        const jailResult = handleJailLogic(currentPlayer, finalValue);
        
        if (!jailResult.canMove) {
          const updatedPlayers = prev.players.map((player, index) => 
            index === prev.currentPlayerIndex 
              ? { ...player, ...jailResult.effects }
              : player
          );
          
          return {
            ...prev,
            players: updatedPlayers,
            diceValue: finalValue,
            isRolling: false,
            gameLog: [...prev.gameLog, `${currentPlayer.name} rolled ${finalValue} but remains in jail (${currentPlayer.jailTurns + 1}/3 turns)`].slice(-10)
          };
        }
        
        // Player can move - calculate new position
        let newPosition = (currentPlayer.position + finalValue) % prev.locations.length;
        const passedStart = newPosition < currentPlayer.position && !currentPlayer.inJail;
        
        // Handle special tile effects
        const newLocation = prev.locations[newPosition];
        const { transactions: specialTransactions, specialEffects } = handleSpecialTile(currentPlayer, newLocation, finalValue);
        
        // Apply special effects (like teleporting or going to jail)
        if (specialEffects.position !== undefined) {
          newPosition = specialEffects.position;
        }
        
        let updatedPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { 
                ...player, 
                position: newPosition,
                ...jailResult.effects,
                ...specialEffects
              }
            : player
        );

        let logEntries = [`${currentPlayer.name} rolled ${finalValue}`];
        
        if (currentPlayer.inJail && jailResult.canMove) {
          logEntries.push(`${currentPlayer.name} got out of jail!`);
        }
        
        logEntries.push(`${currentPlayer.name} moved to ${prev.locations[newPosition].name}`);
        
        // Add special effect messages
        if (specialEffects.position !== undefined && prev.locations[newPosition].type === 'port') {
          logEntries.push(`${currentPlayer.name} teleported via PORT!`);
        }
        if (specialEffects.inJail) {
          logEntries.push(`${currentPlayer.name} was sent to prison!`);
        }
        if (specialEffects.skipNextTurn) {
          logEntries.push(`${currentPlayer.name} will skip next turn (SABAT)`);
        }
        if (specialEffects.immunityUntil) {
          logEntries.push(`${currentPlayer.name} gained immunity for 1 round (CORT)`);
        }
        
        // Handle passing start bonus
        if (passedStart) {
          const startTransaction = handlePassStart(currentPlayer);
          updatedPlayers = applyTransactions(updatedPlayers, [startTransaction]);
          logEntries.push(`${currentPlayer.name} passed Antiohia and received 200 denarii`);
        }

        // Handle landing on special tiles for card drawing
        const finalLocation = prev.locations[newPosition];
        if (finalLocation.type === 'community-chest') {
          const card = drawCommunityCard();
          if (card) {
            return {
              ...prev,
              diceValue: finalValue,
              isRolling: false,
              players: updatedPlayers,
              gameLog: [...prev.gameLog, ...logEntries, `${currentPlayer.name} drew a Community Chest card`].slice(-10),
              drawnCard: card,
              cardType: 'community'
            };
          }
        } else if (finalLocation.type === 'chance') {
          const card = drawChanceCard();
          if (card) {
            return {
              ...prev,
              diceValue: finalValue,
              isRolling: false,
              players: updatedPlayers,
              gameLog: [...prev.gameLog, ...logEntries, `${currentPlayer.name} drew a Chance card`].slice(-10),
              drawnCard: card,
              cardType: 'chance'
            };
          }
        }
        
        return {
          ...prev,
          diceValue: finalValue,
          isRolling: false,
          players: updatedPlayers,
          gameLog: [...prev.gameLog, ...logEntries].slice(-10),
        };
      });
    }, 1500);
  }, [gameState.isRolling, handlePassStart, applyTransactions, drawCommunityCard, drawChanceCard]);

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
      drawnCard: null,
      cardType: null,
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

  // Buy land functionality
  const buyLand = useCallback((playerId: string, locationId: string) => {
    setGameState(prevState => {
      const location = prevState.locations.find(l => l.id === locationId);
      if (!location) return prevState;

      const newState = {
        ...prevState,
        locations: prevState.locations.map(loc =>
          loc.id === locationId
            ? { ...loc, owner: playerId }
            : loc
        ),
        players: prevState.players.map(player =>
          player.id === playerId
            ? { 
                ...player, 
                money: player.money - location.price,
                properties: [...player.properties, locationId]
              }
            : player
        ),
        gameLog: [
          ...prevState.gameLog,
          `${prevState.players.find(p => p.id === playerId)?.name} bought land in ${location.name}`
        ].slice(-10)
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
  }, []);

  // Handle card action after player confirms
  const handleCardAction = useCallback((card: Card) => {
    setGameState(prevState => {
      const currentPlayer = prevState.players[prevState.currentPlayerIndex];
      const cardResult = processCardAction(card, currentPlayer.position, prevState.locations.length);
      
      // For money cards, use the processed result amount
      let transactions = [];
      if (card.action_type === 'add_money' && cardResult.moneyChange > 0) {
        transactions = [{
          playerId: currentPlayer.id,
          amount: cardResult.moneyChange,
          reason: 'Community/Chance card reward',
          type: 'income' as const
        }];
      } else {
        transactions = processEconomyAction(currentPlayer, card.action_type, card.action_value);
      }
      const updatedPlayers = applyTransactions(prevState.players, transactions);
      
      const newState = {
        ...prevState,
        players: updatedPlayers,
        gameLog: [...prevState.gameLog, `${currentPlayer.name}: ${cardResult.description}`].slice(-10),
        drawnCard: null,
        cardType: null
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
  }, [processCardAction, processEconomyAction, applyTransactions]);

  // Build church on property
  const buildChurch = useCallback((playerId: string, locationId: string) => {
    setGameState(prevState => {
      const location = prevState.locations.find(l => l.id === locationId);
      const player = prevState.players.find(p => p.id === playerId);
      
      if (!location || !player || location.owner !== playerId || player.money < location.churchCost) {
        return prevState;
      }

      const newState = {
        ...prevState,
        locations: prevState.locations.map(loc =>
          loc.id === locationId
            ? { ...loc, buildings: { ...loc.buildings, churches: loc.buildings.churches + 1 } }
            : loc
        ),
        players: prevState.players.map(p =>
          p.id === playerId
            ? { ...p, money: p.money - location.churchCost }
            : p
        ),
        gameLog: [
          ...prevState.gameLog,
          `${player.name} built a church in ${location.name}`
        ].slice(-10)
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
  }, []);

  // Build synagogue on property
  const buildSynagogue = useCallback((playerId: string, locationId: string) => {
    setGameState(prevState => {
      const location = prevState.locations.find(l => l.id === locationId);
      const player = prevState.players.find(p => p.id === playerId);
      
      if (!location || !player || location.owner !== playerId || player.money < location.synagogueCost) {
        return prevState;
      }

      const newState = {
        ...prevState,
        locations: prevState.locations.map(loc =>
          loc.id === locationId
            ? { ...loc, buildings: { ...loc.buildings, synagogues: loc.buildings.synagogues + 1 } }
            : loc
        ),
        players: prevState.players.map(p =>
          p.id === playerId
            ? { ...p, money: p.money - location.synagogueCost }
            : p
        ),
        gameLog: [
          ...prevState.gameLog,
          `${player.name} built a synagogue in ${location.name}`
        ].slice(-10)
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
  }, []);

  // Pay rent to property owner
  const payRent = useCallback((payerId: string, locationId: string) => {
    setGameState(prevState => {
      const location = prevState.locations.find(l => l.id === locationId);
      const payer = prevState.players.find(p => p.id === payerId);
      const owner = prevState.players.find(p => p.id === location?.owner);
      
      if (!location || !payer || !owner || location.owner === payerId) {
        return prevState;
      }

      const rentAmount = Math.min(location.rent, payer.money);

      const newState = {
        ...prevState,
        players: prevState.players.map(p => {
          if (p.id === payerId) {
            return { ...p, money: p.money - rentAmount };
          }
          if (p.id === location.owner) {
            return { ...p, money: p.money + rentAmount };
          }
          return p;
        }),
        gameLog: [
          ...prevState.gameLog,
          `${payer.name} paid ${rentAmount} denarii rent to ${owner.name} for ${location.name}`
        ].slice(-10)
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
  }, []);

  // Check win conditions
  const checkWinCondition = useCallback((state: LocalGameState, settings?: any): { hasWinner: boolean; winner?: Player; reason?: string } => {
    const { players, round } = state;
    
    // Check if only one player has money (bankruptcy)
    const playersWithMoney = players.filter(p => p.money > 0);
    if (playersWithMoney.length === 1) {
      return {
        hasWinner: true,
        winner: playersWithMoney[0],
        reason: 'Last player standing'
      };
    }

    // Check church goal (if set)
    if (settings?.churchGoal) {
      for (const player of players) {
        const totalChurches = state.locations
          .filter(loc => loc.owner === player.id)
          .reduce((sum, loc) => sum + loc.buildings.churches, 0);
        
        if (totalChurches >= settings.churchGoal) {
          return {
            hasWinner: true,
            winner: player,
            reason: `Built ${totalChurches} churches`
          };
        }
      }
    }

    // Check round limit (if set)
    if (settings?.roundLimit && round >= settings.roundLimit) {
      // Winner is player with most money
      const winner = players.reduce((richest, player) => 
        player.money > richest.money ? player : richest
      );
      return {
        hasWinner: true,
        winner,
        reason: `Round limit reached - richest player`
      };
    }

    return { hasWinner: false };
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
    buyLand,
    buildChurch,
    buildSynagogue,
    payRent,
    handleCardAction,
    checkWinCondition,
  };
};
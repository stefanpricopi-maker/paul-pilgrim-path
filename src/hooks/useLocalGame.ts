import { useState, useCallback, useEffect } from 'react';
import { Player, GameLocation } from '@/types/game';
import { Card } from '@/types/cards';
import { BIBLICAL_CHARACTERS } from '@/types/game';
import { GAME_LOCATIONS } from '@/data/locations';
import { useCards } from './useCards';
import { useEconomy } from './useEconomy';
import { useAI } from './useAI';
import { useAchievements } from './useAchievements';
import { AIPlayer } from '@/types/ai';

interface LocalGameState {
  players: (Player | AIPlayer)[];
  currentPlayerIndex: number;
  locations: GameLocation[];
  gameStarted: boolean;
  dice1: number;
  dice2: number;
  isRolling: boolean;
  gameLog: string[];
  round: number;
  rentPaidThisTurn: Record<string, boolean>; // Track rent payments per location per turn
  showCardModal: boolean;
  drawnCard: Card | null;
  cardType: 'community' | 'chance' | null;
  aiDecision: string;
  isAIThinking: boolean;
}

export const useLocalGame = () => {
  const { loadCards, drawCommunityCard, drawChanceCard, processCardAction } = useCards();
  const { handlePassStart, handleCardAction: processEconomyAction, applyTransactions } = useEconomy();
  const { createAIPlayer, shouldAIBuyProperty, shouldAIBuildChurch, shouldAIBuildSynagogue } = useAI();
  const { 
    initializePlayerAchievements, 
    updateCurrentGameStat, 
    incrementCurrentGameStat,
    checkAchievement,
    recordGameEnd,
    getPlayerAchievements
  } = useAchievements();
  
  // Ensure GAME_LOCATIONS is properly initialized and create a deep copy to prevent mutations
  const initializeLocations = () => {
    if (!GAME_LOCATIONS || !Array.isArray(GAME_LOCATIONS)) {
      console.error('GAME_LOCATIONS is not properly initialized');
      return [];
    }
    // Create a deep copy to prevent mutations to the original data
    return GAME_LOCATIONS.map(location => ({
      ...location,
      buildings: { ...location.buildings }
    }));
  };

  const [gameState, setGameState] = useState<LocalGameState>(() => ({
    players: [],
    currentPlayerIndex: 0,
    locations: initializeLocations(),
    gameStarted: false,
    dice1: 0,
    dice2: 0,
    isRolling: false,
    gameLog: [],
    round: 1,
    rentPaidThisTurn: {},
    showCardModal: false,
    drawnCard: null,
    cardType: null,
    aiDecision: '',
    isAIThinking: false,
  }));

  const [currentPlayerPrivate, setCurrentPlayerPrivate] = useState(true);

  // Load cards only when game starts (deferred loading for performance)
  const [cardsLoaded, setCardsLoaded] = useState(false);
  
  const ensureCardsLoaded = useCallback(async () => {
    if (!cardsLoaded) {
      await loadCards();
      setCardsLoaded(true);
    }
  }, [loadCards, cardsLoaded]);

  // Create local game with players and settings
  const createLocalGame = useCallback((playerNames: string[], playerColors: string[], settings?: any) => {
    const initialMoney = settings?.initialBalance || 1000;
    
    const players: (Player | AIPlayer)[] = playerNames.map((name, index) => {
      const playerSetup = settings?.players?.[index];
      const character = BIBLICAL_CHARACTERS[index % BIBLICAL_CHARACTERS.length];
      
      if (playerSetup?.isAI) {
        return createAIPlayer(
          `local-${index}`,
          name,
          character,
          playerColors[index] || `hsl(var(--game-player${(index % 6) + 1}))`,
          playerSetup.aiPersonality || 0
        );
      }
      
      return {
        id: `local-${index}`,
        name,
        character,
        position: 0,
        money: initialMoney,
        properties: [],
        propertyVisits: {},
        hasRolled: false,
        color: playerColors[index] || `hsl(var(--game-player${(index % 6) + 1}))`,
        inJail: false,
        jailTurns: 0,
        hasGetOutOfJailCard: false,
        immunityUntil: 0,
        skipNextTurn: false,
        consecutiveDoubles: 0,
      };
    });

    // Initialize achievements for all players
    players.forEach(player => {
      initializePlayerAchievements(player.id, player.name);
    });

    // Load cards when game starts
    ensureCardsLoaded();

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

    // Auto-roll for AI if first player is AI
    setTimeout(() => {
      const firstPlayer = players[0];
      const isAI = 'isAI' in firstPlayer && firstPlayer.isAI;
      if (isAI) {
        rollDice();
      }
    }, 2000); // 2 second delay for game to initialize
  }, [ensureCardsLoaded]);

  // Load saved local game
  const loadLocalGame = useCallback(() => {
    const saved = localStorage.getItem('localGameState');
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        
        // Validate the saved state has required properties
        if (!savedState.players || !Array.isArray(savedState.players)) {
          console.error('Invalid saved state: missing or invalid players array');
          return false;
        }
        
        setGameState(prev => ({
          ...prev,
          ...savedState,
          locations: initializeLocations(), // Use fresh locations to prevent corruption
          dice1: 0,
          dice2: 0,
          isRolling: false,
          gameLog: savedState.gameLog || [],
          rentPaidThisTurn: {},
          showCardModal: false,
          drawnCard: null,
          cardType: null,
          aiDecision: '',
          isAIThinking: false,
        }));
        return true;
      } catch (error) {
        console.error('Failed to load saved game:', error);
        // Clear corrupted save data
        localStorage.removeItem('localGameState');
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
        // Check for general tile types
        if (location.type === 'sacrifice') {
          // JERTFA: Pay sacrifice tax
          const tax = 100;
          transactions.push({
            playerId: player.id,
            amount: -tax,
            reason: `Sacrifice tax at ${location.name}`
          });
        } else if (location.type === 'port') {
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
    console.log("Roll dice called");
    
    setGameState(prev => {
      // Check all conditions using the latest state
      if (prev.isRolling) {
        console.log("Already rolling, returning");
        return prev;
      }
      
      // Validate current player exists
      if (!prev.players || prev.players.length === 0) {
        console.log("No players in game");
        return prev;
      }
      
      if (prev.currentPlayerIndex >= prev.players.length || prev.currentPlayerIndex < 0) {
        console.log("Invalid currentPlayerIndex:", prev.currentPlayerIndex, "Players length:", prev.players.length);
        return prev;
      }
      
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      if (!currentPlayer) {
        console.log("Current player is undefined at index:", prev.currentPlayerIndex);
        return prev;
      }
      
      console.log("Current player:", currentPlayer.name, "hasRolled:", currentPlayer.hasRolled);
      if (currentPlayer.hasRolled) {
        console.log("Player has already rolled this turn");
        return prev; // Player can only roll once per turn
      }

      // All checks passed, start rolling
      return { ...prev, isRolling: true };
    });

    // Simulate dice animation
    const rollAnimation = setInterval(() => {
      setGameState(prev => ({ 
        ...prev, 
        dice1: Math.floor(Math.random() * 6) + 1,
        dice2: Math.floor(Math.random() * 6) + 1
      }));
    }, 100);

    setTimeout(() => {
      clearInterval(rollAnimation);
      const dice1Value = Math.floor(Math.random() * 6) + 1;
      const dice2Value = Math.floor(Math.random() * 6) + 1;
      const totalValue = dice1Value + dice2Value;
      const isDoubles = dice1Value === dice2Value;
      
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
            dice1: dice1Value,
            dice2: dice2Value,
            isRolling: false,
            gameLog: [...prev.gameLog, `${currentPlayer.name} skipped their turn due to SABAT`].slice(-10)
          };
        }
        
        // Handle jail logic
        const jailResult = handleJailLogic(currentPlayer, totalValue);
        
        if (!jailResult.canMove && !isDoubles) {
          const updatedPlayers = prev.players.map((player, index) => 
            index === prev.currentPlayerIndex 
              ? { ...player, ...jailResult.effects }
              : player
          );
          
          return {
            ...prev,
            players: updatedPlayers,
            dice1: dice1Value,
            dice2: dice2Value,
            isRolling: false,
            gameLog: [...prev.gameLog, `${currentPlayer.name} rolled ${dice1Value}+${dice2Value}=${totalValue} but remains in jail (${currentPlayer.jailTurns + 1}/3 turns)`].slice(-10)
          };
        }
        
        // Player can move - calculate new position
        let newPosition = (currentPlayer.position + totalValue) % prev.locations.length;
        const passedStart = (currentPlayer.position + totalValue) >= prev.locations.length && !currentPlayer.inJail;
        
        // Handle special tile effects
        const newLocation = prev.locations[newPosition];
        const { transactions: specialTransactions, specialEffects } = handleSpecialTile(currentPlayer, newLocation, totalValue);
        
        // Apply special effects (like teleporting or going to jail)
        if (specialEffects.position !== undefined) {
          newPosition = specialEffects.position;
        }
        
        // Track property visits for owned properties
        const finalLocation = prev.locations[newPosition];
        let propertyVisitUpdate = {};
        if (finalLocation.type === 'city' && finalLocation.owner === currentPlayer.id) {
          const currentVisits = currentPlayer.propertyVisits[finalLocation.id] || 0;
          propertyVisitUpdate = {
            propertyVisits: {
              ...currentPlayer.propertyVisits,
              [finalLocation.id]: currentVisits + 1
            }
          };
        }

        let updatedPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { 
                ...player, 
                position: newPosition,
                hasRolled: true, // Mark that player has rolled
                ...jailResult.effects,
                ...specialEffects,
                ...propertyVisitUpdate
              }
            : player
        );

        let logEntries = [`${currentPlayer.name} rolled ${dice1Value}+${dice2Value}=${totalValue}${isDoubles ? ' (doubles!)' : ''}`];
        
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
         
         // Apply special tile transactions (sacrifice tax, etc.)
         if (specialTransactions.length > 0) {
           updatedPlayers = applyTransactions(updatedPlayers, specialTransactions);
           specialTransactions.forEach(transaction => {
             logEntries.push(transaction.reason);
           });
         }
         
         // Handle passing start bonus
         if (passedStart) {
           const startTransaction = handlePassStart(currentPlayer);
           updatedPlayers = applyTransactions(updatedPlayers, [startTransaction]);
           logEntries.push(`${currentPlayer.name} passed Antiohia and received 200 denarii`);
         }

        // Handle landing on special tiles for card drawing
        const currentLocation = prev.locations[newPosition];
        if (currentLocation.type === 'community-chest') {
          const card = drawCommunityCard();
          if (card) {
            return {
              ...prev,
              dice1: dice1Value,
              dice2: dice2Value,
              isRolling: false,
              players: updatedPlayers,
              gameLog: [...prev.gameLog, ...logEntries, `${currentPlayer.name} drew a Community Chest card`].slice(-10),
              drawnCard: card,
              cardType: 'community'
            };
          }
        } else if (currentLocation.type === 'chance') {
          const card = drawChanceCard();
          if (card) {
            return {
              ...prev,
              dice1: dice1Value,
              dice2: dice2Value,
              isRolling: false,
              players: updatedPlayers,
              gameLog: [...prev.gameLog, ...logEntries, `${currentPlayer.name} drew a Chance card`].slice(-10),
              drawnCard: card,
              cardType: 'chance'
            };
          }
        }
        
        // Track achievements
        incrementCurrentGameStat(currentPlayer.id, 'passedStart');
        if (isDoubles) {
          incrementCurrentGameStat(currentPlayer.id, 'doublesRolled');
        }

        // Handle AI decision making if current player is AI
        const isAI = 'isAI' in currentPlayer && currentPlayer.isAI;
        if (isAI) {
          const aiPlayer = currentPlayer as AIPlayer;
          const currentLocation = prev.locations[newPosition];
          
          // AI decision for buying property
          if (currentLocation.type === 'city' && !currentLocation.owner && aiPlayer.money >= currentLocation.price) {
            if (shouldAIBuyProperty(aiPlayer, currentLocation)) {
              setTimeout(() => buyLand(aiPlayer.id, currentLocation.id), 2000);
              logEntries.push(`${aiPlayer.name} (AI) is considering buying ${currentLocation.name}...`);
            }
          }
          
          // AI decision for building
          if (currentLocation.owner === aiPlayer.id) {
            if (shouldAIBuildChurch(aiPlayer, currentLocation)) {
              setTimeout(() => buildChurch(aiPlayer.id, currentLocation.id), 2500);
              logEntries.push(`${aiPlayer.name} (AI) is planning to build...`);
            } else if (shouldAIBuildSynagogue(aiPlayer, currentLocation)) {
              setTimeout(() => buildSynagogue(aiPlayer.id, currentLocation.id), 2500);
              logEntries.push(`${aiPlayer.name} (AI) is planning to build...`);
            }
          }
        }

        const finalState = {
          ...prev,
          dice1: dice1Value,
          dice2: dice2Value,
          isRolling: false,
          players: updatedPlayers,
          gameLog: [...prev.gameLog, ...logEntries].slice(-10)
        };
        
        // Save to localStorage
        localStorage.setItem('localGameState', JSON.stringify({
          players: finalState.players,
          currentPlayerIndex: finalState.currentPlayerIndex,
          gameStarted: finalState.gameStarted,
          round: finalState.round,
          gameLog: finalState.gameLog,
        }));
        
        return finalState;
      });
    }, 1500);
  }, [gameState.isRolling, handlePassStart, applyTransactions, drawCommunityCard, drawChanceCard, incrementCurrentGameStat, shouldAIBuyProperty, shouldAIBuildChurch, shouldAIBuildSynagogue]);

  // End turn
  const endTurn = useCallback(() => {
    console.log("EndTurn called - resetting hasRolled for next player");
    setGameState(prev => {
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const newRound = nextPlayerIndex === 0 ? prev.round + 1 : prev.round;
      
      console.log("Current player index:", prev.currentPlayerIndex, "Next player index:", nextPlayerIndex);
      
      // Reset hasRolled for ALL players at the start of endTurn to prevent issues
      const playersWithResetRolls = prev.players.map((player) => ({ 
        ...player, 
        hasRolled: false 
      }));
      
      console.log("Reset hasRolled for all players");
      
      const newState = {
        ...prev,
        players: playersWithResetRolls,
        currentPlayerIndex: nextPlayerIndex,
        dice1: 0,
        dice2: 0,
        round: newRound,
        rentPaidThisTurn: {}, // Reset rent tracking for new turn
        gameLog: [...prev.gameLog, `${playersWithResetRolls[nextPlayerIndex]?.name || 'Unknown'}'s turn (Round ${newRound})`].slice(-10),
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
    
    // Auto-roll for AI players after ensuring state update
    setTimeout(() => {
      setGameState(currentState => {
        const nextPlayer = currentState.players[currentState.currentPlayerIndex];
        console.log("Checking AI turn for:", nextPlayer?.name, "isAI:", 'isAI' in nextPlayer && nextPlayer.isAI);
        
        const isAI = nextPlayer && 'isAI' in nextPlayer && nextPlayer.isAI;
        if (isAI && !nextPlayer.hasRolled && !currentState.isRolling) {
          console.log("AI player turn - auto rolling");
          // Call rollDice directly in another timeout to avoid state conflicts
          setTimeout(() => {
            rollDice();
          }, 500);
        }
        return currentState;
      });
    }, 1000);
  }, [rollDice]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      locations: GAME_LOCATIONS,
      gameStarted: false,
      dice1: 0,
      dice2: 0,
      isRolling: false,
      gameLog: [],
      round: 1,
      rentPaidThisTurn: {},
      showCardModal: false,
      drawnCard: null,
      cardType: null,
      aiDecision: '',
      isAIThinking: false,
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
      
      // Track achievements
      incrementCurrentGameStat(playerId, 'propertiesBought');
      
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
      // Safety checks: ensure game state is valid
      if (!prevState.players || prevState.players.length === 0) {
        console.error('No players found when handling card action');
        return prevState;
      }
      
      const currentPlayer = prevState.players[prevState.currentPlayerIndex];
      if (!currentPlayer) {
        console.error('No current player found when handling card action');
        return prevState;
      }
      
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
      } else if ((card.action_type === 'lose_money' || card.action_type === 'pay_money') && cardResult.moneyChange < 0) {
        transactions = [{
          playerId: currentPlayer.id,
          amount: cardResult.moneyChange,
          reason: 'Community/Chance card penalty',
          type: 'expense' as const
        }];
      } else {
        transactions = currentPlayer ? processEconomyAction(currentPlayer, card.action_type, card.action_value) : [];
      }
      const updatedPlayers = applyTransactions(prevState.players, transactions);
      
      // Handle position changes (like go_to_jail)
      let finalPlayers = updatedPlayers;
      if (cardResult.newPosition !== currentPlayer.position) {
        finalPlayers = updatedPlayers.map((player, index) => 
          index === prevState.currentPlayerIndex 
            ? { 
                ...player, 
                position: cardResult.newPosition,
                // If going to jail (position 10), set jail status
                ...(cardResult.newPosition === 10 && card.action_type === 'go_to_jail' ? {
                  inJail: true,
                  jailTurns: 0,
                  consecutiveDoubles: 0
                } : {})
              }
            : player
        );
      }
      
      const newState = {
        ...prevState,
        players: finalPlayers,
        gameLog: [...prevState.gameLog, `${currentPlayer.name}: ${cardResult.description}`].slice(-10),
        drawnCard: null,
        cardType: null
      };
      
      // Save to localStorage - sanitize data before saving
      try {
        localStorage.setItem('localGameState', JSON.stringify({
          players: newState.players,
          currentPlayerIndex: newState.currentPlayerIndex,
          gameStarted: newState.gameStarted,
          round: newState.round,
          gameLog: newState.gameLog,
        }));
      } catch (error) {
        console.error('Failed to save game state:', error);
      }
      
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

      // Check if player has visited this property at least 3 times
      const visits = player.propertyVisits[locationId] || 0;
      if (visits < 3) {
        return prevState; // Cannot build church until third visit
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

      // Check if player has visited this property at least 1 time (first visit building allowed)
      const visits = player.propertyVisits[locationId] || 0;
      if (visits < 1) {
        return prevState; // Cannot build synagogue on first landing, only after visiting
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
        rentPaidThisTurn: {
          ...prevState.rentPaidThisTurn,
          [locationId]: true
        },
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
    playerAchievements: getPlayerAchievements
  };
};
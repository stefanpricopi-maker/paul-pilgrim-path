import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCards } from '@/hooks/useCards';
import { toast } from '@/hooks/use-toast';
import { GameState, Game, Player, GameMember, GameLog, Tile } from '@/types/database';
import { BIBLICAL_CHARACTERS, GameLocation } from '@/types/game';
import { Card } from '@/types/cards';
import { GAME_LOCATIONS } from '@/data/locations';

export const useGameDatabase = () => {
  const { user } = useAuth();
  const { loadCards, drawCommunityCard, drawChanceCard, processCardAction } = useCards();
  const [gameState, setGameState] = useState<GameState>({
    game: null,
    players: [],
    gameMembers: [],
    currentPlayerIndex: 0,
    tiles: [],
    gameStarted: false,
    diceValue: 0,
    dice1: 0,
    dice2: 0,
    isRolling: false,
    gameLog: [],
    isHost: false,
    isMyTurn: false,
  });
  const [loading, setLoading] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [cardType, setCardType] = useState<'community' | 'chance' | null>(null);
  const [gameSettings, setGameSettings] = useState<any>(null);

  // Store game ID in localStorage for persistence
  const storeGameId = useCallback((gameId: string) => {
    localStorage.setItem('currentOnlineGameId', gameId);
  }, []);

  // Clear stored game ID
  const clearStoredGameId = useCallback(() => {
    localStorage.removeItem('currentOnlineGameId');
  }, []);

  // Get stored game ID
  const getStoredGameId = useCallback(() => {
    return localStorage.getItem('currentOnlineGameId');
  }, []);

  // Load game data and set up real-time subscriptions
  const loadGame = useCallback(async (gameId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Load game details
      const { data: game, error: gameError } = await (supabase as any)
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      // Load players
      const { data: players, error: playersError } = await (supabase as any)
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at');

      if (playersError) throw playersError;

      // Load game members
      const { data: gameMembers, error: membersError } = await (supabase as any)
        .from('game_members')
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at');

      if (membersError) throw membersError;

      // Load tiles
      const { data: tiles, error: tilesError } = await (supabase as any)
        .from('tiles')
        .select('*')
        .eq('game_id', gameId)
        .order('tile_index');

      if (tilesError) throw tilesError;

      // Load game log
      const { data: gameLogs, error: logsError } = await (supabase as any)
        .from('game_log')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      console.log('loadGame: Setting game state', {
        game,
        gameStarted: game.status === 'active',
        isHost: game.host_id === user.id,
        playersCount: players?.length || 0,
        membersCount: gameMembers?.length || 0
      });

      setGameState(prev => ({
        ...prev,
        game,
        players: players || [],
        gameMembers: gameMembers || [],
        tiles: tiles || [],
        gameLog: gameLogs || [],
        gameStarted: game.status === 'active',
        isHost: game.host_id === user.id,
        currentPlayerIndex: game.current_turn || 0,
      }));

    } catch (error) {
      toast({
        title: "Error Loading Game",
        description: error instanceof Error ? error.message : "Failed to load game",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Try to reconnect to stored game
  const tryReconnectToStoredGame = useCallback(async () => {
    if (!user) return false;
    
    const storedGameId = getStoredGameId();
    if (!storedGameId) return false;

    try {
      // First, ensure the game still exists and is resumable
      const { data: game, error: gameErr } = await (supabase as any)
        .from('games')
        .select('*')
        .eq('id', storedGameId)
        .single();

      if (gameErr || !game) {
        clearStoredGameId();
        return false;
      }

      if (['finished', 'cancelled'].includes(game.status)) {
        clearStoredGameId();
        return false;
      }

      // Check membership via game_members
      const { data: members, error: membersError } = await (supabase as any)
        .from('game_members')
        .select('id')
        .eq('game_id', storedGameId)
        .eq('user_id', user.id)
        .limit(1);

      const isMember = Array.isArray(members) && members.length > 0;

      // Fallback: check if user has a player row in this game
      let hasPlayer = false;
      if (!isMember) {
        const { data: players } = await (supabase as any)
          .from('players')
          .select('id')
          .eq('game_id', storedGameId)
          .eq('user_id', user.id)
          .limit(1);
        hasPlayer = Array.isArray(players) && players.length > 0;
      }

      if (isMember || hasPlayer) {
        await loadGame(storedGameId);
        return true;
      }

      // User no longer part of this game
      clearStoredGameId();
      return false;
    } catch (error) {
      console.log('Could not reconnect to stored game:', error);
      // Do not clear stored game on transient errors
      return false;
    }
  }, [user, getStoredGameId, loadGame, clearStoredGameId]);

  // Create a new game
  const createGame = useCallback(async (playerName: string, characterName: string) => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a game.",
        variant: "destructive"
      });
      return null;
    }

    // Verify we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session validation failed:', sessionError);
      toast({
        title: "Session Error",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive"
      });
      return null;
    }

    console.log('Creating game with user:', user.id, 'session:', !!session);
    setLoading(true);
    
    try {
      // Create game with client-generated ID to avoid RLS return issues
      const newGameId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      const { error: gameError } = await (supabase as any)
        .from('games')
        .insert({
          id: newGameId,
          host_id: user.id,
          status: 'waiting',
          language: 'en',
          initial_balance: 1000,
        });

      if (gameError) {
        console.error('Game creation error:', gameError);
        throw gameError;
      }

      console.log('Game created successfully with id:', newGameId);

      // Add host as game member
      const { error: memberError } = await (supabase as any)
        .from('game_members')
        .insert({
          game_id: newGameId,
          user_id: user.id,
          role: 'host'
        });

      if (memberError) {
        console.error('Game member creation error:', memberError);
        throw memberError;
      }

      console.log('Game member created successfully');

      // Create player for host
      const { error: playerError } = await (supabase as any)
        .from('players')
        .insert({
          game_id: newGameId,
          user_id: user.id,
          name: playerName,
          character_name: characterName,
          coins: 1000,
          position: 0
        });

      if (playerError) {
        console.error('Player creation error:', playerError);
        throw playerError;
      }

      console.log('Player created successfully');

      // Store game ID for persistence
      storeGameId(newGameId);

      // Load the created game and set up real-time subscriptions
      await loadGame(newGameId);

      // Load cards for game functionality
      await loadCards();

      console.log('Game created successfully, setting up real-time listeners');

      toast({
        title: "Game Created!",
        description: "Share the game ID with other players to join. Real-time updates are active!",
      });

      return newGameId;
    } catch (error) {
      console.error('Game creation failed:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = "Failed to create game";
      if (error instanceof Error) {
        if (error.message.includes('row-level security')) {
          errorMessage = "Authentication error: Unable to create game. Please try signing out and back in.";
        } else if (error.message.includes('duplicate key')) {
          errorMessage = "A game with this information already exists.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error Creating Game",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadGame]);

  // Join an existing game
  const joinGame = useCallback(async (gameId: string, playerName: string, characterName: string) => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join a game.",
        variant: "destructive"
      });
      return false;
    }

    // Verify we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session validation failed:', sessionError);
      toast({
        title: "Session Error",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive"
      });
      return false;
    }

    console.log('Joining game with user:', user.id, 'session:', !!session);
    setLoading(true);
    try {
      // Check if game exists and is joinable
      const { data: game, error: gameError } = await (supabase as any)
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      if (game!.status !== 'waiting') {
        toast({
          title: "Cannot Join Game",
          description: "This game has already started or ended.",
          variant: "destructive"
        });
        return false;
      }

      // Check if user is already in the game
      const { data: existingMember } = await (supabase as any)
        .from('game_members')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        storeGameId(gameId);
        await loadGame(gameId);
        return true;
      }

      // Add as game member
      const { error: memberError } = await (supabase as any)
        .from('game_members')
        .insert({
          game_id: gameId,
          user_id: user.id,
          role: 'player'
        });

      if (memberError) throw memberError;

      // Create player
      const { error: playerError } = await (supabase as any)
        .from('players')
        .insert({
          game_id: gameId,
          user_id: user.id,
          name: playerName,
          character_name: characterName,
          coins: game!.initial_balance || 1000,
          position: 0
        });

      if (playerError) throw playerError;

      // Store game ID for persistence
      storeGameId(gameId);

      await loadGame(gameId);

      // Load cards for game functionality
      await loadCards();

      console.log('Player joined game successfully, real-time subscriptions should update host');

      toast({
        title: "Joined Game!",
        description: "Welcome to the missionary journey.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error Joining Game",
        description: error instanceof Error ? error.message : "Failed to join game",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadGame]);

  // Start the game (host only)
  const startGame = useCallback(async () => {
    if (!gameState.game || !gameState.isHost) return;

    try {
      const { error } = await (supabase as any)
        .from('games')
        .update({ status: 'active' })
        .eq('id', gameState.game.id);

      if (error) throw error;

      // Log game start
      await (supabase as any)
        .from('game_log')
        .insert({
          game_id: gameState.game.id,
          player_id: user?.id,
          action: 'game_start',
          description: `Game started with ${gameState.players.length} players!`,
          round: 1
        });

      toast({
        title: "Journey Begins!",
        description: "May God bless your missionary efforts.",
      });

    } catch (error) {
      toast({
        title: "Error Starting Game",
        description: error instanceof Error ? error.message : "Failed to start game",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isHost, gameState.players.length, user]);

  // Function to leave game
  const leaveGame = useCallback(async () => {
    if (!user || !gameState.game) return false;

    try {
      // Remove player from players table
      const { error: playerError } = await (supabase as any)
        .from('players')
        .delete()
        .eq('game_id', gameState.game.id)
        .eq('user_id', user.id);

      if (playerError) throw playerError;

      // Remove user from game_members table
      const { error: memberError } = await (supabase as any)
        .from('game_members')
        .delete()
        .eq('game_id', gameState.game.id)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Clear stored game ID and reset state
      clearStoredGameId();
      setGameState(prev => ({
        ...prev,
        game: null,
        players: [],
        gameMembers: [],
        tiles: [],
        gameLog: [],
        gameStarted: false,
        isHost: false,
        currentPlayerIndex: 0,
      }));

      toast({
        title: "Left Game",
        description: "You have successfully left the game.",
      });

      return true;
    } catch (error) {
      console.error('Failed to leave game:', error);
      toast({
        title: "Error",
        description: "Failed to leave the game. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, gameState.game, clearStoredGameId]);

  // Roll dice with special tile logic
  const rollDice = useCallback(async () => {
    console.log('rollDice called:', {
      hasGame: !!gameState.game,
      hasUser: !!user,
      isRolling: gameState.isRolling,
      isMyTurn: gameState.isMyTurn,
      currentPlayerIndex: gameState.currentPlayerIndex,
      playersLength: gameState.players.length,
      currentPlayer: gameState.players[gameState.currentPlayerIndex],
      userId: user?.id
    });

    if (!gameState.game) {
      toast({
        title: "No Game",
        description: "No active game found",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in to play",
        variant: "destructive"
      });
      return;
    }

    if (gameState.isRolling) {
      toast({
        title: "Please Wait",
        description: "Dice are already rolling",
        variant: "destructive"
      });
      return;
    }

    if (!gameState.isMyTurn) {
      toast({
        title: "Not Your Turn",
        description: "Please wait for your turn to roll",
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => ({ ...prev, isRolling: true }));

    // Simulate dice roll animation
    setTimeout(async () => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const diceValue = dice1 + dice2;
      const isDouble = dice1 === dice2;
      
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      let newPosition = (currentPlayer.position + diceValue) % 40;
      let updatedPlayer = { ...currentPlayer };
      
      // Track consecutive doubles for jail logic
      if (isDouble) {
        updatedPlayer.consecutive_doubles = (currentPlayer.consecutive_doubles || 0) + 1;
        if (updatedPlayer.consecutive_doubles >= 3) {
          // Go to jail for 3 consecutive doubles
          newPosition = 10; // Prison position
          updatedPlayer.in_jail = true;
          updatedPlayer.consecutive_doubles = 0;
        }
      } else {
        updatedPlayer.consecutive_doubles = 0;
      }

      // Handle special tiles
      const currentLocation = GAME_LOCATIONS[newPosition];
      let logMessage = `${currentPlayer.name} rolled ${dice1}+${dice2}=${diceValue}`;
      let additionalCoins = 0;

      // Check if passed GO (Antiochia)
      if (currentPlayer.position + diceValue >= 40) {
        additionalCoins += 200;
        logMessage += ` and passed Antiochia, receiving 200 denarii`;
      }

      // Special tile effects
      switch (currentLocation.type) {
        case 'special':
          if (currentLocation.id === 'cort') {
            updatedPlayer.immunity_until = Math.floor(gameState.currentPlayerIndex / gameState.players.length) + 2;
            logMessage += ` and gained immunity for 1 round`;
          }
          break;
        
        case 'sacrifice':
          // Pay sacrifice tax (unless immune)
          const currentRound = Math.floor(gameState.currentPlayerIndex / gameState.players.length) + 1;
          if (updatedPlayer.immunity_until < currentRound) {
            const tax = 100;
            updatedPlayer.coins = Math.max(0, updatedPlayer.coins - tax);
            logMessage += ` and pays ${tax} denarii in sacrifice`;
          } else {
            logMessage += ` but is immune to sacrifice`;
          }
          break;

        case 'go-to-prison':
          newPosition = 10; // Prison position
          updatedPlayer.in_jail = true;
          updatedPlayer.jail_turns = 0;
          updatedPlayer.consecutive_doubles = 0;
          logMessage += ` and goes directly to prison`;
          break;

        case 'prison':
          if (currentLocation.id === 'sabat') {
            // Skip next turn
            const { error: skipError } = await (supabase as any)
              .from('players')
              .update({ skip_next_turn: true })
              .eq('id', currentPlayer.id);
            
            if (!skipError) {
              logMessage += ` and must skip their next turn (SABAT)`;
            }
          }
          break;

        case 'port':
          // Teleport to next PORT in clockwise order
          const ports = GAME_LOCATIONS.filter(loc => loc.type === 'port');
          const currentPortIndex = ports.findIndex(port => port.id === currentLocation.id);
          
          if (ports.length > 1 && currentPortIndex !== -1) {
            const nextPortIndex = (currentPortIndex + 1) % ports.length;
            const nextPort = ports[nextPortIndex];
            const nextPortPosition = GAME_LOCATIONS.findIndex(loc => loc.id === nextPort.id);
            
            if (nextPortPosition !== -1) {
              newPosition = nextPortPosition;
              logMessage += ` and teleported from ${currentLocation.name} to ${nextPort.name}`;
            }
          }
          break;

        case 'community-chest':
          // Draw community card
          const communityCard = drawCommunityCard();
          if (communityCard) {
            setDrawnCard(communityCard);
            setCardType('community');
            logMessage += ` and draws a Community card: ${communityCard.text_en}`;
          }
          break;

        case 'chance':
          // Draw chance card
          const chanceCard = drawChanceCard();
          if (chanceCard) {
            setDrawnCard(chanceCard);
            setCardType('chance');
            logMessage += ` and draws a Chance card: ${chanceCard.text_en}`;
          }
          break;
      }

      // Add any additional coins from bonuses
      updatedPlayer.coins += additionalCoins;

      try {
        console.log('Attempting to update player:', {
          playerId: currentPlayer.id,
          newPosition,
          coins: updatedPlayer.coins,
          userId: user?.id
        });

        // Update player in database
        const { error: playerError } = await supabase
          .from('players')
          .update({ 
            position: newPosition, 
            coins: updatedPlayer.coins,
            in_jail: updatedPlayer.in_jail,
            immunity_until: updatedPlayer.immunity_until,
            consecutive_doubles: updatedPlayer.consecutive_doubles || 0
          })
          .eq('id', currentPlayer.id);

        if (playerError) {
          console.error('Player update error:', playerError);
          throw playerError;
        }

        console.log('Player updated successfully, logging move...');

        // Log the move
        const { error: logError } = await supabase
          .from('game_log')
          .insert({
            game_id: gameState.game.id,
            player_id: user?.id,
            action: 'dice_roll',
            description: logMessage,
            round: Math.floor(gameState.currentPlayerIndex / gameState.players.length) + 1
          });

        if (logError) {
          console.error('Game log error:', logError);
          // Don't throw on log error, just log it
        }

        console.log('Dice roll completed successfully');

        // Update local state immediately for responsive UI
        setGameState(prev => {
          const updatedPlayers = [...prev.players];
          const playerIndex = updatedPlayers.findIndex(p => p.id === currentPlayer.id);
          if (playerIndex !== -1) {
            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              position: newPosition,
              coins: updatedPlayer.coins,
              in_jail: updatedPlayer.in_jail,
              immunity_until: updatedPlayer.immunity_until,
              consecutive_doubles: updatedPlayer.consecutive_doubles || 0
            };
          }
          
          return {
            ...prev,
            diceValue,
            dice1,
            dice2,
            isRolling: false,
            players: updatedPlayers
          };
        });

      } catch (error) {
        console.error('Dice roll error:', error);
        toast({
          title: "Error Rolling Dice",
          description: error instanceof Error ? error.message : "Failed to roll dice",
          variant: "destructive"
        });
        setGameState(prev => ({ ...prev, isRolling: false }));
      }
    }, 800);
  }, [gameState.game, gameState.isRolling, gameState.isMyTurn, gameState.players, gameState.currentPlayerIndex, user]);

  // End turn with skip turn logic
  const endTurn = useCallback(async () => {
    if (!gameState.game || !gameState.isMyTurn) return;

    try {
      let nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      // Check if next player should skip their turn
      const nextPlayer = gameState.players[nextPlayerIndex];
      if (nextPlayer?.skip_next_turn) {
        // Reset skip turn flag and advance to next player
        await (supabase as any)
          .from('players')
          .update({ skip_next_turn: false })
          .eq('id', nextPlayer.id);
          
        // Log the skip
        await (supabase as any)
          .from('game_log')
          .insert({
            game_id: gameState.game.id,
            player_id: user?.id,
            action: 'skip_turn',
            description: `${nextPlayer.name} skips their turn due to Sabat`,
            round: Math.floor(nextPlayerIndex / gameState.players.length) + 1
          });
          
        // Advance to the next player
        nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
      }
      
      const { error } = await (supabase as any)
        .from('games')
        .update({ current_turn: nextPlayerIndex })
        .eq('id', gameState.game.id);

      if (error) throw error;

      setGameState(prev => ({
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: 0,
        isMyTurn: gameState.players[nextPlayerIndex]?.user_id === user?.id
      }));

    } catch (error) {
      toast({
        title: "Error Ending Turn",
        description: error instanceof Error ? error.message : "Failed to end turn",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, gameState.currentPlayerIndex, gameState.players, user]);

  // Set up real-time subscriptions + waiting-room polling fallback
  useEffect(() => {
    if (!gameState.game?.id || !user) return;

    const gameId = gameState.game.id;
    console.log('Setting up real-time subscriptions for game:', gameId);

    const gameChannel = supabase
      .channel(`game_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('Players changed:', payload);
          loadGame(gameId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        () => {
          console.log('Game changed, reloading game data');
          loadGame(gameId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_log',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          console.log('Game log changed, reloading game data');
          loadGame(gameId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tiles',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          console.log('Tiles changed, reloading game data');
          loadGame(gameId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_members',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          console.log('Game members changed, reloading game data');
          loadGame(gameId);
        }
      )
      .subscribe();

    // Fallback: poll while waiting to ensure host sees new joins
    let pollInterval: number | undefined;
    if (gameState.game.status === 'waiting') {
      pollInterval = window.setInterval(() => {
        loadGame(gameId);
      }, 2000);
    }

    return () => {
      if (pollInterval) window.clearInterval(pollInterval);
      supabase.removeChannel(gameChannel);
    };
  }, [gameState.game?.id, gameState.game?.status, user]);

  // Update isMyTurn when players or current turn changes
  useEffect(() => {
    if (!user || !gameState.players.length) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer?.user_id === user.id;
    
    console.log('isMyTurn calculation:', {
      currentPlayerIndex: gameState.currentPlayerIndex,
      currentPlayer,
      currentPlayerUserId: currentPlayer?.user_id,
      userUserId: user.id,
      isMyTurn,
      allPlayers: gameState.players.map(p => ({ id: p.id, name: p.name, user_id: p.user_id }))
    });
    
    setGameState(prev => ({
      ...prev,
      isMyTurn
    }));
  }, [user, gameState.players, gameState.currentPlayerIndex]);

  // Convert tiles to game locations for rendering
  const getGameLocations = useCallback((): GameLocation[] => {
    return GAME_LOCATIONS.map((location, index) => {
      const tile = gameState.tiles.find(t => t.tile_index === index);
      return {
        ...location,
        owner: tile?.owner_id,
        buildings: {
          churches: 0, // TODO: Get from property_buildings table
          synagogues: 0
        }
      };
    });
  }, [gameState.tiles]);

  // Buy land functionality
  const buyLand = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;

    // Find the tile by location index
    const locationIndex = GAME_LOCATIONS.findIndex(loc => loc.id === locationId);
    if (locationIndex === -1) return;

    const tile = gameState.tiles.find(t => t.tile_index === locationIndex);
    if (!tile) return;

    // Check if tile is already owned
    if (tile.owner_id) {
      toast({
        title: "Cannot Purchase",
        description: "This land is already owned!",
        variant: "destructive"
      });
      return;
    }

    const location = GAME_LOCATIONS[locationIndex];
    
    // Check if player has enough money
    if (currentPlayer.coins < location.price) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${location.price} denarii to purchase this land`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Update tile ownership
      const { error: tileError } = await (supabase as any)
        .from('tiles')
        .update({ owner_id: currentPlayer.id })
        .eq('id', tile.id);

      if (tileError) throw tileError;

      // Deduct money from player
      const { error: playerError } = await (supabase as any)
        .from('players')
        .update({ coins: currentPlayer.coins - location.price })
        .eq('id', currentPlayer.id);

      if (playerError) throw playerError;

      // Add game log entry
      await (supabase as any)
        .from('game_log')
        .insert({
          game_id: gameState.game.id,
          player_id: currentPlayer.id,
          action: 'buy_land',
          description: `${currentPlayer.name} purchased ${location.name} for ${location.price} denarii`
        });

      toast({
        title: "Land Purchased!",
        description: `You now own ${location.name}`,
      });

    } catch (error) {
      console.error('Error buying land:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase land",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, gameState.players, gameState.currentPlayerIndex, gameState.tiles, user]);

  // Build church on owned property
  const buildChurch = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;

    // Find the tile by location index
    const locationIndex = GAME_LOCATIONS.findIndex(loc => loc.id === locationId);
    if (locationIndex === -1) return;

    const tile = gameState.tiles.find(t => t.tile_index === locationIndex);
    if (!tile) return;

    // Check if player owns this tile
    if (tile.owner_id !== currentPlayer.id) {
      toast({
        title: "Cannot Build",
        description: "You must own this property to build on it",
        variant: "destructive"
      });
      return;
    }

    const location = GAME_LOCATIONS[locationIndex];
    
    // Check if player has enough money
    if (currentPlayer.coins < location.churchCost) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${location.churchCost} denarii to build a church`,
        variant: "destructive"
      });
      return;
    }

    // For online game, we need to track property visits differently
    // For now, allow building after owning (simplified version)
    try {
      // Increment building count in database
      const { error: buildingError } = await (supabase as any)
        .rpc('increment_building_count', {
          p_tile_id: tile.id,
          p_building_type: 'church'
        });

      if (buildingError) throw buildingError;

      // Deduct money from player
      const { error: playerError } = await (supabase as any)
        .from('players')
        .update({ coins: currentPlayer.coins - location.churchCost })
        .eq('id', currentPlayer.id);

      if (playerError) throw playerError;

      // Add game log entry
      await (supabase as any)
        .from('game_log')
        .insert({
          game_id: gameState.game.id,
          player_id: currentPlayer.id,
          action: 'build_church',
          description: `${currentPlayer.name} built a church in ${location.name} for ${location.churchCost} denarii`
        });

      toast({
        title: "Church Built!",
        description: `Built a church in ${location.name}`,
      });

    } catch (error) {
      console.error('Error building church:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to build church",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, gameState.players, gameState.currentPlayerIndex, gameState.tiles, user]);

  // Build synagogue on owned property
  const buildSynagogue = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;

    // Find the tile by location index
    const locationIndex = GAME_LOCATIONS.findIndex(loc => loc.id === locationId);
    if (locationIndex === -1) return;

    const tile = gameState.tiles.find(t => t.tile_index === locationIndex);
    if (!tile) return;

    // Check if player owns this tile
    if (tile.owner_id !== currentPlayer.id) {
      toast({
        title: "Cannot Build",
        description: "You must own this property to build on it",
        variant: "destructive"
      });
      return;
    }

    const location = GAME_LOCATIONS[locationIndex];
    
    // Check if player has enough money
    if (currentPlayer.coins < location.synagogueCost) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${location.synagogueCost} denarii to build a synagogue`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Increment building count in database
      const { error: buildingError } = await (supabase as any)
        .rpc('increment_building_count', {
          p_tile_id: tile.id,
          p_building_type: 'synagogue'
        });

      if (buildingError) throw buildingError;

      // Deduct money from player
      const { error: playerError } = await (supabase as any)
        .from('players')
        .update({ coins: currentPlayer.coins - location.synagogueCost })
        .eq('id', currentPlayer.id);

      if (playerError) throw playerError;

      // Add game log entry
      await (supabase as any)
        .from('game_log')
        .insert({
          game_id: gameState.game.id,
          player_id: currentPlayer.id,
          action: 'build_synagogue',
          description: `${currentPlayer.name} built a synagogue in ${location.name} for ${location.synagogueCost} denarii`
        });

      toast({
        title: "Synagogue Built!",
        description: `Built a synagogue in ${location.name}`,
      });

    } catch (error) {
      console.error('Error building synagogue:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to build synagogue",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, gameState.players, gameState.currentPlayerIndex, gameState.tiles, user]);

  // Pay rent to property owner
  const payRent = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;

    // Find the tile by location index
    const locationIndex = GAME_LOCATIONS.findIndex(loc => loc.id === locationId);
    if (locationIndex === -1) return;

    const tile = gameState.tiles.find(t => t.tile_index === locationIndex);
    if (!tile || !tile.owner_id) return;

    // Can't pay rent to yourself
    if (tile.owner_id === currentPlayer.id) {
      toast({
        title: "Cannot Pay Rent",
        description: "You own this property!",
        variant: "destructive"
      });
      return;
    }

    // Find the owner
    const owner = gameState.players.find(p => p.id === tile.owner_id);
    if (!owner) return;

    const location = GAME_LOCATIONS[locationIndex];
    let rentAmount = location.rent;

    // Calculate rent based on buildings (if any)
    try {
      // Get building counts for this tile
      const { data: buildings, error: buildingError } = await (supabase as any)
        .from('property_buildings')
        .select('building_type, count')
        .eq('tile_id', tile.id);

      if (!buildingError && buildings) {
        // Add rent for buildings
        const churches = buildings.find((b: any) => b.building_type === 'church')?.count || 0;
        const synagogues = buildings.find((b: any) => b.building_type === 'synagogue')?.count || 0;
        
        rentAmount += churches * 50; // Churches add 50 denarii rent each
        rentAmount += synagogues * 25; // Synagogues add 25 denarii rent each
      }

      // Calculate actual payment amount (can't pay more than player has)
      const actualPayment = Math.min(rentAmount, currentPlayer.coins);

      // Update both players' coins
      const { error: payerError } = await (supabase as any)
        .from('players')
        .update({ coins: currentPlayer.coins - actualPayment })
        .eq('id', currentPlayer.id);

      if (payerError) throw payerError;

      const { error: ownerError } = await (supabase as any)
        .from('players')
        .update({ coins: owner.coins + actualPayment })
        .eq('id', owner.id);

      if (ownerError) throw ownerError;

      // Add game log entry
      await (supabase as any)
        .from('game_log')
        .insert({
          game_id: gameState.game.id,
          player_id: currentPlayer.id,
          action: 'pay_rent',
          description: `${currentPlayer.name} paid ${actualPayment} denarii rent to ${owner.name} for ${location.name}`
        });

      toast({
        title: "Rent Paid!",
        description: `Paid ${actualPayment} denarii to ${owner.name}`,
      });

    } catch (error) {
      console.error('Error paying rent:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pay rent",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, gameState.players, gameState.currentPlayerIndex, gameState.tiles, user]);

  // Handle card action after player clicks OK on card modal
  const handleCardAction = useCallback(async (card: Card) => {
    if (!gameState.game || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;

    try {
      // Process the card action
      const cardResult = processCardAction(card, currentPlayer.position, 40);
      
      let updatedPlayer = { ...currentPlayer };
      let finalPosition = currentPlayer.position;

      // Handle money changes
      if (cardResult.moneyChange !== 0) {
        updatedPlayer.coins = Math.max(0, updatedPlayer.coins + cardResult.moneyChange);
      }

      // Handle position changes
      if (cardResult.newPosition !== currentPlayer.position) {
        finalPosition = cardResult.newPosition;
      }

      // Handle special card effects
      if (card.action_type === 'get_out_of_jail') {
        updatedPlayer.has_get_out_of_jail_card = true;
      } else if (card.action_type === 'go_to_jail') {
        updatedPlayer.in_jail = true;
        updatedPlayer.jail_turns = 0;
        finalPosition = 10; // Prison position
      }

      // Update player in database
      const { error: playerError } = await (supabase as any)
        .from('players')
        .update({
          position: finalPosition,
          coins: updatedPlayer.coins,
          in_jail: updatedPlayer.in_jail,
          jail_turns: updatedPlayer.jail_turns,
          has_get_out_of_jail_card: updatedPlayer.has_get_out_of_jail_card
        })
        .eq('id', currentPlayer.id);

      if (playerError) throw playerError;

      // Log the card action
      await (supabase as any)
        .from('game_log')
        .insert({
          game_id: gameState.game.id,
          player_id: currentPlayer.id,
          action: 'card_drawn',
          description: `${currentPlayer.name}: ${cardResult.description}`
        });

      // Clear the card modal
      setDrawnCard(null);
      setCardType(null);

    } catch (error) {
      console.error('Error handling card action:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process card",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.players, gameState.currentPlayerIndex, user, processCardAction]);

  // Function to load settings
  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('game_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      setGameSettings(data);
      return data;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }, []);

  // Function to update settings
  const updateGameSettings = useCallback(async (settings: any) => {
    try {
      const { data, error } = await (supabase as any)
        .from('game_settings')
        .upsert(settings)
        .select()
        .single();
      
      if (error) throw error;
      
      setGameSettings(data);
      return data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return null;
    }
  }, []);

  return {
    gameState,
    loading,
    createGame,
    joinGame,
    loadGame,
    startGame,
    rollDice,
    endTurn,
    buyLand,
    buildChurch,
    buildSynagogue,
    payRent,
    handleCardAction,
    drawnCard,
    cardType,
    getGameLocations,
    tryReconnectToStoredGame,
    clearStoredGameId,
    getStoredGameId,
    gameSettings,
    loadSettings,
    updateGameSettings,
    leaveGame,
  };
};

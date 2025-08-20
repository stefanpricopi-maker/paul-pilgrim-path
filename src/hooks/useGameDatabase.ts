import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { GameState, Game, Player, GameMember, GameLog, Tile } from '@/types/database';
import { BIBLICAL_CHARACTERS, GameLocation } from '@/types/game';
import { GAME_LOCATIONS } from '@/data/locations';

export const useGameDatabase = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    game: null,
    players: [],
    gameMembers: [],
    currentPlayerIndex: 0,
    tiles: [],
    gameStarted: false,
    diceValue: 0,
    isRolling: false,
    gameLog: [],
    isHost: false,
    isMyTurn: false,
  });
  const [loading, setLoading] = useState(false);

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

      // Load the created game and set up real-time subscriptions
      await loadGame(newGameId);

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

      await loadGame(gameId);

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

  // Roll dice with special tile logic
  const rollDice = useCallback(async () => {
    if (!gameState.game || !user || gameState.isRolling || !gameState.isMyTurn) return;

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

      // Check if passed GO (Antiochia)
      if (currentPlayer.position + diceValue >= 40) {
        updatedPlayer.coins += 200;
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
        
        case 'prison':
          if (currentLocation.id === 'sabat') {
            // Skip next turn
            const { error: skipError } = await (supabase as any)
              .from('players')
              .update({ skip_next_turn: true })
              .eq('id', currentPlayer.id);
            
            if (!skipError) {
              logMessage += ` and must skip their next turn`;
            }
          }
          break;

        case 'port':
          // Teleport to next PORT
          const ports = GAME_LOCATIONS.filter(loc => loc.type === 'port');
          const currentPortIndex = ports.findIndex(port => port.id === currentLocation.id);
          const nextPortIndex = (currentPortIndex + 1) % ports.length;
          const nextPort = ports[nextPortIndex];
          const nextPortPosition = GAME_LOCATIONS.findIndex(loc => loc.id === nextPort.id);
          
          if (nextPortPosition !== -1) {
            newPosition = nextPortPosition;
            logMessage += ` and teleported to ${nextPort.name}`;
          }
          break;

        case 'go-to-prison':
          newPosition = 10; // Prison position
          updatedPlayer.in_jail = true;
          logMessage += ` and goes to prison`;
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
      }

      try {
        // Update player in database
        const { error: playerError } = await (supabase as any)
          .from('players')
          .update({ 
            position: newPosition, 
            coins: updatedPlayer.coins,
            in_jail: updatedPlayer.in_jail,
            immunity_until: updatedPlayer.immunity_until,
            consecutive_doubles: updatedPlayer.consecutive_doubles || 0
          })
          .eq('id', currentPlayer.id);

        if (playerError) throw playerError;

        // Log the move
        await (supabase as any)
          .from('game_log')
          .insert({
            game_id: gameState.game.id,
            player_id: currentPlayer.id,
            action: 'dice_roll',
            description: logMessage,
            round: Math.floor(gameState.currentPlayerIndex / gameState.players.length) + 1
          });

        setGameState(prev => ({
          ...prev,
          diceValue,
          isRolling: false
        }));

      } catch (error) {
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
            player_id: nextPlayer.id,
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

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameState.game?.id || !user) return;

    console.log('Setting up real-time subscriptions for game:', gameState.game.id);

    const gameChannel = supabase
      .channel(`game_${gameState.game.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameState.game.id}`
        },
        (payload) => {
          console.log('Players changed:', payload);
          loadGame(gameState.game!.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameState.game.id}`
        },
        () => {
          console.log('Game changed, reloading game data');
          loadGame(gameState.game!.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_log',
          filter: `game_id=eq.${gameState.game.id}`
        },
        () => {
          console.log('Game log changed, reloading game data');
          loadGame(gameState.game!.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tiles',
          filter: `game_id=eq.${gameState.game.id}`
        },
        () => {
          console.log('Tiles changed, reloading game data');
          loadGame(gameState.game!.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_members',
          filter: `game_id=eq.${gameState.game.id}`
        },
        () => {
          console.log('Game members changed, reloading game data');
          loadGame(gameState.game!.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameState.game, loadGame]);

  // Update isMyTurn when players or current turn changes
  useEffect(() => {
    if (!user || !gameState.players.length) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    setGameState(prev => ({
      ...prev,
      isMyTurn: currentPlayer?.user_id === user.id
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

  return {
    gameState,
    loading,
    createGame,
    joinGame,
    loadGame,
    startGame,
    rollDice,
    endTurn,
    getGameLocations,
  };
};
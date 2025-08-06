import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { GameState, Game, Player, GameMember, GameLog, Tile } from '@/types/database';
import { BIBLICAL_CHARACTERS } from '@/types/game';

export const useGameDatabase = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    game: null,
    players: [],
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

      // Load tiles
      const { data: tiles, error: tilesError } = await (supabase as any)
        .from('tiles')
        .select('*')
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

      setGameState(prev => ({
        ...prev,
        game,
        players: players || [],
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
      // Create game
      const { data: game, error: gameError } = await (supabase as any)
        .from('games')
        .insert({
          host_id: user.id,
          status: 'waiting',
          language: 'en',
          initial_balance: 1000,
        })
        .select()
        .single();

      if (gameError) {
        console.error('Game creation error:', gameError);
        throw gameError;
      }

      console.log('Game created successfully:', game.id);

      // Add host as game member
      const { error: memberError } = await (supabase as any)
        .from('game_members')
        .insert({
          game_id: game!.id,
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
          game_id: game!.id,
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

      // Load the created game
      await loadGame(game!.id);

      toast({
        title: "Game Created!",
        description: "Share the game ID with other players to join.",
      });

      return game!.id;
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

  // Roll dice
  const rollDice = useCallback(async () => {
    if (!gameState.game || !user || gameState.isRolling || !gameState.isMyTurn) return;

    setGameState(prev => ({ ...prev, isRolling: true }));

    // Simulate dice roll animation
    setTimeout(async () => {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const newPosition = (currentPlayer.position + diceValue) % 40; // Assuming 40 tiles

      try {
        // Update player position
        const { error: playerError } = await (supabase as any)
          .from('players')
          .update({ position: newPosition })
          .eq('id', currentPlayer.id);

        if (playerError) throw playerError;

        // Log the move
        await (supabase as any)
          .from('game_log')
          .insert({
            game_id: gameState.game.id,
            player_id: currentPlayer.id,
            action: 'dice_roll',
            description: `${currentPlayer.name} rolled ${diceValue} and moved to position ${newPosition}`,
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

  // End turn
  const endTurn = useCallback(async () => {
    if (!gameState.game || !gameState.isMyTurn) return;

    try {
      const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      const { error } = await (supabase as any)
        .from('games')
        .update({ current_turn: nextPlayerIndex })
        .eq('id', gameState.game.id);

      if (error) throw error;

      setGameState(prev => ({
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: 0,
        isMyTurn: gameState.players[nextPlayerIndex]?.id === user?.id
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
    if (!gameState.game) return;

    const gameChannel = (supabase as any)
      .channel(`game_${gameState.game.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameState.game.id}`
        },
        () => {
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
          loadGame(gameState.game!.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_log',
          filter: `game_id=eq.${gameState.game.id}`
        },
        () => {
          loadGame(gameState.game!.id);
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(gameChannel);
    };
  }, [gameState.game, loadGame]);

  // Update isMyTurn when players or current turn changes
  useEffect(() => {
    if (!user || !gameState.players.length) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    setGameState(prev => ({
      ...prev,
      isMyTurn: currentPlayer?.id === user.id
    }));
  }, [user, gameState.players, gameState.currentPlayerIndex]);

  return {
    gameState,
    loading,
    createGame,
    joinGame,
    loadGame,
    startGame,
    rollDice,
    endTurn,
  };
};
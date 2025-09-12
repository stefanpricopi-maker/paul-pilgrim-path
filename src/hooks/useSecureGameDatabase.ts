import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCards } from '@/hooks/useCards';
import { toast } from '@/hooks/use-toast';
import { GameState, Game, Player, GameMember, GameLog, Tile } from '@/types/database';
import { BIBLICAL_CHARACTERS, GameLocation } from '@/types/game';
import { Card } from '@/types/cards';
import { GAME_LOCATIONS } from '@/data/locations';

export const useSecureGameDatabase = () => {
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

      // Ensure consistent player ordering across all clients
      const sortedPlayers = (players || []).slice().sort((a: any, b: any) => {
        const ca = a.created_at || '';
        const cb = b.created_at || '';
        const cmp = ca.localeCompare(cb);
        return cmp !== 0 ? cmp : (a.id || '').localeCompare(b.id || '');
      });

      setGameState(prev => ({
        ...prev,
        game,
        players: sortedPlayers,
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
      // Use secure RPC function to create game
      const { data, error } = await supabase.rpc('secure_create_game', {
        p_player_name: playerName,
        p_character_name: characterName,
        p_initial_balance: 1000,
        p_language: 'en'
      });

      if (error) {
        console.error('Game creation error:', error);
        throw error;
      }

      const newGameId = data;
      console.log('Game created successfully with id:', newGameId);

      // Store game ID for persistence
      storeGameId(newGameId);

      // Load the created game and set up real-time subscriptions
      await loadGame(newGameId);

      // Load cards for game functionality
      await loadCards();

      toast({
        title: "Game Created!",
        description: "Share the game ID with other players to join. Real-time updates are active!",
      });

      return newGameId;
    } catch (error) {
      console.error('Game creation failed:', error);
      
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
      // Use secure RPC function to join game
      const { error } = await supabase.rpc('secure_join_game', {
        p_game_id: gameId,
        p_player_name: playerName,
        p_character_name: characterName
      });

      if (error) throw error;

      // Store game ID for persistence
      storeGameId(gameId);

      await loadGame(gameId);

      // Load cards for game functionality
      await loadCards();

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
      const { error } = await supabase.rpc('secure_start_game', {
        p_game_id: gameState.game.id
      });

      if (error) throw error;

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
  }, [gameState.game, gameState.isHost]);

  // Function to leave game
  const leaveGame = useCallback(async () => {
    if (!user || !gameState.game) return false;

    try {
      const { error } = await supabase.rpc('secure_leave_game', {
        p_game_id: gameState.game.id
      });

      if (error) throw error;

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

  // Roll dice using secure RPC function
  const rollDice = useCallback(async () => {
    console.log('rollDice called:', {
      hasGame: !!gameState.game,
      hasUser: !!user,
      isRolling: gameState.isRolling,
      isMyTurn: gameState.isMyTurn
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

    try {
      // Use secure RPC function to roll dice
      const { data, error } = await supabase.rpc('secure_roll_dice', {
        p_game_id: gameState.game.id
      });

      if (error) throw error;

      // Handle any cards that were drawn
      if (data?.card_drawn) {
        if (data.card_type === 'community') {
          const card = drawCommunityCard();
          if (card) {
            setDrawnCard(card);
            setCardType('community');
          }
        } else if (data.card_type === 'chance') {
          const card = drawChanceCard();
          if (card) {
            setDrawnCard(card);
            setCardType('chance');
          }
        }
      }

      // Update local state with dice values
      if (data?.dice1 && data?.dice2) {
        setGameState(prev => ({
          ...prev,
          dice1: data.dice1,
          dice2: data.dice2,
          diceValue: data.dice1 + data.dice2,
          isRolling: false
        }));
      }

      console.log('Dice roll completed successfully');

    } catch (error) {
      console.error('Dice roll error:', error);
      toast({
        title: "Error Rolling Dice",
        description: error instanceof Error ? error.message : "Failed to roll dice",
        variant: "destructive"
      });
      setGameState(prev => ({ ...prev, isRolling: false }));
    }
  }, [gameState.game, gameState.isRolling, gameState.isMyTurn, user, drawCommunityCard, drawChanceCard]);

  // End turn using secure RPC function
  const endTurn = useCallback(async () => {
    if (!gameState.game || !gameState.isMyTurn) return;

    try {
      const { error } = await supabase.rpc('secure_end_turn', {
        p_game_id: gameState.game.id
      });

      if (error) throw error;

    } catch (error) {
      toast({
        title: "Error Ending Turn",
        description: error instanceof Error ? error.message : "Failed to end turn",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn]);

  // Buy land using secure RPC function
  const buyLand = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;

    try {
      const { error } = await supabase.rpc('secure_buy_land', {
        p_game_id: gameState.game.id,
        p_location_id: locationId
      });

      if (error) throw error;

      toast({
        title: "Land Purchased!",
        description: "You have successfully purchased this land.",
      });

    } catch (error) {
      toast({
        title: "Error Purchasing Land",
        description: error instanceof Error ? error.message : "Failed to purchase land",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, gameState.currentPlayerIndex, gameState.players, user]);

  // Build church using secure RPC function
  const buildChurch = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    try {
      const { error } = await supabase.rpc('secure_build_church', {
        p_game_id: gameState.game.id,
        p_location_id: locationId
      });

      if (error) throw error;

      toast({
        title: "Church Built!",
        description: "Your church has been constructed successfully.",
      });

    } catch (error) {
      toast({
        title: "Error Building Church",
        description: error instanceof Error ? error.message : "Failed to build church",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, user]);

  // Build synagogue using secure RPC function
  const buildSynagogue = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    try {
      const { error } = await supabase.rpc('secure_build_synagogue', {
        p_game_id: gameState.game.id,
        p_location_id: locationId
      });

      if (error) throw error;

      toast({
        title: "Synagogue Built!",
        description: "Your synagogue has been constructed successfully.",
      });

    } catch (error) {
      toast({
        title: "Error Building Synagogue",
        description: error instanceof Error ? error.message : "Failed to build synagogue",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, user]);

  // Pay rent using secure RPC function
  const payRent = useCallback(async (locationId: string) => {
    if (!gameState.game || !gameState.isMyTurn || !user) return;

    try {
      const { error } = await supabase.rpc('secure_pay_rent', {
        p_game_id: gameState.game.id,
        p_location_id: locationId
      });

      if (error) throw error;

      toast({
        title: "Rent Paid",
        description: "You have paid the required rent.",
      });

    } catch (error) {
      toast({
        title: "Error Paying Rent",
        description: error instanceof Error ? error.message : "Failed to pay rent",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.isMyTurn, user]);

  // Handle card action
  const handleCardAction = useCallback(async (card: Card) => {
    if (!gameState.game || !user) return;

    try {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (!currentPlayer) return;

      const { moneyChange, newPosition } = processCardAction(card, currentPlayer.position, 40);
      
      if (moneyChange !== 0 || newPosition !== currentPlayer.position) {
        const { error } = await supabase.rpc('secure_handle_card_action', {
          p_game_id: gameState.game.id,
          p_card_id: card.id,
          p_coin_change: moneyChange,
          p_move_to_position: newPosition
        });

        if (error) throw error;
      }

      setDrawnCard(null);
      setCardType(null);

    } catch (error) {
      toast({
        title: "Error Processing Card",
        description: error instanceof Error ? error.message : "Failed to process card action",
        variant: "destructive"
      });
    }
  }, [gameState.game, gameState.players, gameState.currentPlayerIndex, user, processCardAction]);

  // Set up real-time subscriptions
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
  }, [gameState.game?.id, user, loadGame]);

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
    
    if (gameState.isMyTurn !== isMyTurn) {
      setGameState(prev => ({
        ...prev,
        isMyTurn
      }));
    }
  }, [user, gameState.players, gameState.currentPlayerIndex, gameState.isMyTurn]);

  return {
    gameState,
    loading,
    createGame,
    joinGame,
    startGame,
    leaveGame,
    rollDice,
    endTurn,
    buyLand,
    buildChurch,
    buildSynagogue,
    payRent,
    handleCardAction,
    drawnCard,
    cardType,
    loadGame,
    tryReconnectToStoredGame,
    storeGameId,
    clearStoredGameId,
    getStoredGameId,
  };
};
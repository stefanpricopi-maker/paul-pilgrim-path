// Define types based on our known database schema
export interface Game {
  id: string;
  host_id: string | null;
  status: string;
  language: string;
  initial_balance: number;
  current_turn: number;
  round_limit: number | null;
  church_goal: number | null;
  win_condition: string | null;
  created_at: string;
}

export interface GameInsert {
  host_id: string;
  status?: string;
  language?: string;
  initial_balance?: number;
  current_turn?: number;
  round_limit?: number | null;
  church_goal?: number | null;
  win_condition?: string | null;
}

export interface Player {
  id: string;
  game_id: string | null;
  user_id: string | null;
  name: string;
  character_name: string | null;
  avatar_url: string | null;
  position: number;
  coins: number;
  in_jail: boolean;
  jail_turns: number;
  has_get_out_of_jail_card: boolean;
  immunity_until: number;
  skip_next_turn?: boolean;
  consecutive_doubles?: number;
  created_at: string;
}

export interface PlayerInsert {
  id?: string;
  game_id: string;
  user_id: string;
  name: string;
  character_name: string;
  avatar_url?: string | null;
  position?: number;
  coins?: number;
  in_jail?: boolean;
  jail_turns?: number;
  has_get_out_of_jail_card?: boolean;
  immunity_until?: number;
  skip_next_turn?: boolean;
  consecutive_doubles?: number;
}

export interface GameMember {
  id: string;
  game_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface GameMemberInsert {
  game_id: string;
  user_id: string;
  role?: string;
}

export interface GameLog {
  id: number;
  game_id: string | null;
  player_id: string | null;
  action: string | null;
  description: string | null;
  round: number | null;
  created_at: string;
}

export interface GameLogInsert {
  game_id: string;
  player_id?: string | null;
  action?: string | null;
  description?: string | null;
  round?: number | null;
}

export interface Tile {
  id: number;
  name: string;
  type: string | null;
  tile_index: number;
  owner_id: string | null;
  building_type: string | null;
  created_at: string;
}

export interface GameState {
  game: Game | null;
  players: Player[];
  gameMembers: GameMember[];
  currentPlayerIndex: number;
  tiles: Tile[];
  gameStarted: boolean;
  diceValue: number;
  isRolling: boolean;
  gameLog: GameLog[];
  isHost: boolean;
  isMyTurn: boolean;
}
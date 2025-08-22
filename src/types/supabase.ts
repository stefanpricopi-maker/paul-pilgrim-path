export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string;
          is_admin?: boolean;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
      };
      tiles: {
        Row: {
          id: string;
          name: string;
          type: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
        };
        Update: {
          name?: string;
          type?: string;
        };
      };
      // add other tables here if needed
    };
    Functions: {
      cleanup_old_games: {
        Args: {};
        Returns: {
          games_deleted: number;
          logs_deleted: number;
          members_deleted: number;
          players_deleted: number;
          tiles_deleted: number;
        }[];
      };
      copy_template_tiles: {
        Args: {};
        Returns: any[];
      };
      get_profile_admin_status: {
        Args: { user_id: string };
        Returns: { is_admin: boolean }[];
      };
    };
  };
}

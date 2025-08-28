export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      buildings: {
        Row: {
          cost: number
          created_at: string | null
          icon_url: string | null
          id: number
          income: number | null
          type: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          icon_url?: string | null
          id?: number
          income?: number | null
          type: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          icon_url?: string | null
          id?: number
          income?: number | null
          type?: string
        }
        Relationships: []
      }
      cards_chance: {
        Row: {
          action_type: string | null
          action_value: string | null
          category: string | null
          created_at: string | null
          id: number
          text_en: string
          text_ro: string
        }
        Insert: {
          action_type?: string | null
          action_value?: string | null
          category?: string | null
          created_at?: string | null
          id?: number
          text_en: string
          text_ro: string
        }
        Update: {
          action_type?: string | null
          action_value?: string | null
          category?: string | null
          created_at?: string | null
          id?: number
          text_en?: string
          text_ro?: string
        }
        Relationships: []
      }
      cards_community: {
        Row: {
          action_type: string | null
          action_value: string | null
          category: string | null
          created_at: string | null
          id: number
          text_en: string
          text_ro: string
        }
        Insert: {
          action_type?: string | null
          action_value?: string | null
          category?: string | null
          created_at?: string | null
          id?: number
          text_en: string
          text_ro: string
        }
        Update: {
          action_type?: string | null
          action_value?: string | null
          category?: string | null
          created_at?: string | null
          id?: number
          text_en?: string
          text_ro?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          ability_key: string | null
          ability_type: string | null
          description_en: string | null
          description_ro: string | null
          icon_url: string | null
          id: number
          name: string
        }
        Insert: {
          ability_key?: string | null
          ability_type?: string | null
          description_en?: string | null
          description_ro?: string | null
          icon_url?: string | null
          id?: number
          name: string
        }
        Update: {
          ability_key?: string | null
          ability_type?: string | null
          description_en?: string | null
          description_ro?: string | null
          icon_url?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      cleanup_config: {
        Row: {
          description: string | null
          id: number
          setting_name: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          setting_name: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          setting_name?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cleanup_log: {
        Row: {
          cleanup_completed_at: string | null
          cleanup_started_at: string | null
          cleanup_type: string
          error_message: string | null
          games_deleted: number | null
          id: number
          related_records_deleted: number | null
          success: boolean | null
        }
        Insert: {
          cleanup_completed_at?: string | null
          cleanup_started_at?: string | null
          cleanup_type: string
          error_message?: string | null
          games_deleted?: number | null
          id?: number
          related_records_deleted?: number | null
          success?: boolean | null
        }
        Update: {
          cleanup_completed_at?: string | null
          cleanup_started_at?: string | null
          cleanup_type?: string
          error_message?: string | null
          games_deleted?: number | null
          id?: number
          related_records_deleted?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
      game_log: {
        Row: {
          action: string | null
          created_at: string | null
          description: string | null
          game_id: string | null
          id: number
          player_id: string | null
          round: number | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          game_id?: string | null
          id?: number
          player_id?: string | null
          round?: number | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          game_id?: string | null
          id?: number
          player_id?: string | null
          round?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_log_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_members: {
        Row: {
          game_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_members_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          church_goal: number | null
          created_at: string | null
          current_turn: number | null
          host_id: string | null
          id: string
          initial_balance: number | null
          language: string | null
          round_limit: number | null
          status: string | null
          win_condition: string | null
        }
        Insert: {
          church_goal?: number | null
          created_at?: string | null
          current_turn?: number | null
          host_id?: string | null
          id?: string
          initial_balance?: number | null
          language?: string | null
          round_limit?: number | null
          status?: string | null
          win_condition?: string | null
        }
        Update: {
          church_goal?: number | null
          created_at?: string | null
          current_turn?: number | null
          host_id?: string | null
          id?: string
          initial_balance?: number | null
          language?: string | null
          round_limit?: number | null
          status?: string | null
          win_condition?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          avatar_url: string | null
          character_name: string | null
          coins: number | null
          consecutive_doubles: number
          created_at: string | null
          game_id: string | null
          has_get_out_of_jail_card: boolean | null
          id: string
          immunity_until: number | null
          in_jail: boolean | null
          jail_turns: number | null
          name: string
          position: number | null
          skip_next_turn: boolean
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          character_name?: string | null
          coins?: number | null
          consecutive_doubles?: number
          created_at?: string | null
          game_id?: string | null
          has_get_out_of_jail_card?: boolean | null
          id?: string
          immunity_until?: number | null
          in_jail?: boolean | null
          jail_turns?: number | null
          name: string
          position?: number | null
          skip_next_turn?: boolean
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          character_name?: string | null
          coins?: number | null
          consecutive_doubles?: number
          created_at?: string | null
          game_id?: string | null
          has_get_out_of_jail_card?: boolean | null
          id?: string
          immunity_until?: number | null
          in_jail?: boolean | null
          jail_turns?: number | null
          name?: string
          position?: number | null
          skip_next_turn?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      tiles: {
        Row: {
          building_type: string | null
          created_at: string | null
          game_id: string | null
          id: number
          name: string
          owner_id: string | null
          tile_index: number
          type: string | null
        }
        Insert: {
          building_type?: string | null
          created_at?: string | null
          game_id?: string | null
          id?: number
          name: string
          owner_id?: string | null
          tile_index: number
          type?: string | null
        }
        Update: {
          building_type?: string | null
          created_at?: string | null
          game_id?: string | null
          id?: number
          name?: string
          owner_id?: string | null
          tile_index?: number
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiles_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_games: {
        Args: Record<PropertyKey, never>
        Returns: {
          games_deleted: number
          logs_deleted: number
          members_deleted: number
          players_deleted: number
          tiles_deleted: number
        }[]
      }
      copy_template_tiles: {
        Args: { target_game_id: string }
        Returns: undefined
      }
      debug_admin_status: {
        Args: { uid: string }
        Returns: {
          found: boolean
          is_admin: boolean
          profile_id: string
        }[]
      }
      ensure_admin: {
        Args: { user_id: string }
        Returns: undefined
      }
      get_profile_admin_status: {
        Args: { user_id: string }
        Returns: {
          is_admin: boolean
        }[]
      }
      is_member_of_game: {
        Args: { target_game_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

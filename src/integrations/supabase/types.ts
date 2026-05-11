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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          animation_speed: number
          animation_style: string
          bg_from: string
          bg_image_opacity: number
          bg_image_url: string | null
          bg_to: string
          canvas_height: number
          canvas_width: number
          card_height: number
          card_width: number
          column_gap: number
          created_at: string
          id: string
          player_text_color: string
          sort_order: number
          subtitle: string
          subtitle_color: string
          team_a_color: string
          team_a_logo_scale: number
          team_a_logo_url: string | null
          team_a_logo_x: number
          team_a_logo_y: number
          team_a_name: string
          team_a_players: Json
          team_b_color: string
          team_b_logo_scale: number
          team_b_logo_url: string | null
          team_b_logo_x: number
          team_b_logo_y: number
          team_b_name: string
          team_b_players: Json
          title: string
          title_color: string
          title_font: string
          title_size: number
          updated_at: string
          user_id: string
          vs_badge_url: string | null
        }
        Insert: {
          animation_speed?: number
          animation_style?: string
          bg_from?: string
          bg_image_opacity?: number
          bg_image_url?: string | null
          bg_to?: string
          canvas_height?: number
          canvas_width?: number
          card_height?: number
          card_width?: number
          column_gap?: number
          created_at?: string
          id?: string
          player_text_color?: string
          sort_order?: number
          subtitle?: string
          subtitle_color?: string
          team_a_color?: string
          team_a_logo_scale?: number
          team_a_logo_url?: string | null
          team_a_logo_x?: number
          team_a_logo_y?: number
          team_a_name?: string
          team_a_players?: Json
          team_b_color?: string
          team_b_logo_scale?: number
          team_b_logo_url?: string | null
          team_b_logo_x?: number
          team_b_logo_y?: number
          team_b_name?: string
          team_b_players?: Json
          title?: string
          title_color?: string
          title_font?: string
          title_size?: number
          updated_at?: string
          user_id: string
          vs_badge_url?: string | null
        }
        Update: {
          animation_speed?: number
          animation_style?: string
          bg_from?: string
          bg_image_opacity?: number
          bg_image_url?: string | null
          bg_to?: string
          canvas_height?: number
          canvas_width?: number
          card_height?: number
          card_width?: number
          column_gap?: number
          created_at?: string
          id?: string
          player_text_color?: string
          sort_order?: number
          subtitle?: string
          subtitle_color?: string
          team_a_color?: string
          team_a_logo_scale?: number
          team_a_logo_url?: string | null
          team_a_logo_x?: number
          team_a_logo_y?: number
          team_a_name?: string
          team_a_players?: Json
          team_b_color?: string
          team_b_logo_scale?: number
          team_b_logo_url?: string | null
          team_b_logo_x?: number
          team_b_logo_y?: number
          team_b_name?: string
          team_b_players?: Json
          title?: string
          title_color?: string
          title_font?: string
          title_size?: number
          updated_at?: string
          user_id?: string
          vs_badge_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

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
      alternatives: {
        Row: {
          badges: string[] | null
          brand: string | null
          carbon_footprint: number | null
          created_at: string
          eco_score: number | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          original_product_id: string | null
          price: number | null
          reasons: string[] | null
          savings_percentage: number | null
        }
        Insert: {
          badges?: string[] | null
          brand?: string | null
          carbon_footprint?: number | null
          created_at?: string
          eco_score?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          original_product_id?: string | null
          price?: number | null
          reasons?: string[] | null
          savings_percentage?: number | null
        }
        Update: {
          badges?: string[] | null
          brand?: string | null
          carbon_footprint?: number | null
          created_at?: string
          eco_score?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          original_product_id?: string | null
          price?: number | null
          reasons?: string[] | null
          savings_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alternatives_original_product_id_fkey"
            columns: ["original_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context_product_id: string | null
          created_at: string
          id: string
          messages: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context_product_id?: string | null
          created_at?: string
          id?: string
          messages?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context_product_id?: string | null
          created_at?: string
          id?: string
          messages?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_context_product_id_fkey"
            columns: ["context_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badges: string[] | null
          barcode: string | null
          brand: string | null
          carbon_footprint: number | null
          created_at: string
          eco_score: number | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          recyclable: boolean | null
          sustainable: boolean | null
          updated_at: string
        }
        Insert: {
          badges?: string[] | null
          barcode?: string | null
          brand?: string | null
          carbon_footprint?: number | null
          created_at?: string
          eco_score?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          recyclable?: boolean | null
          sustainable?: boolean | null
          updated_at?: string
        }
        Update: {
          badges?: string[] | null
          barcode?: string | null
          brand?: string | null
          carbon_footprint?: number | null
          created_at?: string
          eco_score?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          recyclable?: boolean | null
          sustainable?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          eco_score_avg: number | null
          full_name: string | null
          id: string
          points: number
          total_co2_saved: number
          total_scans: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          eco_score_avg?: number | null
          full_name?: string | null
          id?: string
          points?: number
          total_co2_saved?: number
          total_scans?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          eco_score_avg?: number | null
          full_name?: string | null
          id?: string
          points?: number
          total_co2_saved?: number
          total_scans?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      scans: {
        Row: {
          alternatives_suggested: number | null
          co2_footprint: number | null
          created_at: string
          detected_name: string | null
          eco_score: number | null
          id: string
          image_url: string | null
          metadata: Json | null
          points_earned: number | null
          product_id: string | null
          scan_type: string
          user_id: string
        }
        Insert: {
          alternatives_suggested?: number | null
          co2_footprint?: number | null
          created_at?: string
          detected_name?: string | null
          eco_score?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          points_earned?: number | null
          product_id?: string | null
          scan_type: string
          user_id: string
        }
        Update: {
          alternatives_suggested?: number | null
          co2_footprint?: number | null
          created_at?: string
          detected_name?: string | null
          eco_score?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          points_earned?: number | null
          product_id?: string | null
          scan_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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

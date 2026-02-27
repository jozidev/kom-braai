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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      braais: {
        Row: {
          created_at: string
          date_mode: string
          description: string | null
          event_date: string | null
          event_options: Json
          event_time: string | null
          id: string
          max_attendees: number | null
          organiser_id: string
          slug: string
          status: string
          supply_mode: string
          title: string
          updated_at: string
          venue_address: string
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string
        }
        Insert: {
          created_at?: string
          date_mode: string
          description?: string | null
          event_date?: string | null
          event_options?: Json
          event_time?: string | null
          id?: string
          max_attendees?: number | null
          organiser_id: string
          slug: string
          status?: string
          supply_mode: string
          title: string
          updated_at?: string
          venue_address: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name: string
        }
        Update: {
          created_at?: string
          date_mode?: string
          description?: string | null
          event_date?: string | null
          event_options?: Json
          event_time?: string | null
          id?: string
          max_attendees?: number | null
          organiser_id?: string
          slug?: string
          status?: string
          supply_mode?: string
          title?: string
          updated_at?: string
          venue_address?: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "braais_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "organisers"
            referencedColumns: ["id"]
          },
        ]
      }
      date_poll_options: {
        Row: {
          braai_id: string
          created_at: string
          id: string
          proposed_date: string
        }
        Insert: {
          braai_id: string
          created_at?: string
          id?: string
          proposed_date: string
        }
        Update: {
          braai_id?: string
          created_at?: string
          id?: string
          proposed_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_poll_options_braai_id_fkey"
            columns: ["braai_id"]
            isOneToOne: false
            referencedRelation: "braais"
            referencedColumns: ["id"]
          },
        ]
      }
      date_poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_option_id: string
          voter_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_option_id: string
          voter_name: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_option_id?: string
          voter_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "date_poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      organisers: {
        Row: {
          avatar_url: string | null
          braai_title: string
          created_at: string
          display_name: string
          fire_preference: string
          id: string
          nickname: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          braai_title: string
          created_at?: string
          display_name: string
          fire_preference: string
          id: string
          nickname?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          braai_title?: string
          created_at?: string
          display_name?: string
          fire_preference?: string
          id?: string
          nickname?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          attendee_count: number
          attendee_name: string
          braai_id: string
          browser_token: string
          created_at: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          attendee_count?: number
          attendee_name: string
          braai_id: string
          browser_token: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          attendee_count?: number
          attendee_name?: string
          braai_id?: string
          browser_token?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_braai_id_fkey"
            columns: ["braai_id"]
            isOneToOne: false
            referencedRelation: "braais"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_items: {
        Row: {
          braai_id: string
          category: string
          claimed_by_name: string | null
          created_at: string
          id: string
          item_name: string
          provided_by: string
        }
        Insert: {
          braai_id: string
          category: string
          claimed_by_name?: string | null
          created_at?: string
          id?: string
          item_name: string
          provided_by: string
        }
        Update: {
          braai_id?: string
          category?: string
          claimed_by_name?: string | null
          created_at?: string
          id?: string
          item_name?: string
          provided_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_items_braai_id_fkey"
            columns: ["braai_id"]
            isOneToOne: false
            referencedRelation: "braais"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

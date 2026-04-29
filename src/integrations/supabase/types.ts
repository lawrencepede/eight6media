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
  public: {
    Tables: {
      brand_assets: {
        Row: {
          brand_colors: Json | null
          created_at: string
          description: string | null
          domain: string
          icon_url: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          raw_data: Json | null
          updated_at: string
        }
        Insert: {
          brand_colors?: Json | null
          created_at?: string
          description?: string | null
          domain: string
          icon_url?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          raw_data?: Json | null
          updated_at?: string
        }
        Update: {
          brand_colors?: Json | null
          created_at?: string
          description?: string | null
          domain?: string
          icon_url?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          raw_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string
          expertise: string[] | null
          followers: string | null
          id: string
          image: string | null
          instagram_handle: string
          location: string | null
          metrics: Json | null
          name: string
          niche: string | null
          slug: string | null
          tiktok_handle: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          followers?: string | null
          id?: string
          image?: string | null
          instagram_handle: string
          location?: string | null
          metrics?: Json | null
          name: string
          niche?: string | null
          slug?: string | null
          tiktok_handle?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          followers?: string | null
          id?: string
          image?: string | null
          instagram_handle?: string
          location?: string | null
          metrics?: Json | null
          name?: string
          niche?: string | null
          slug?: string | null
          tiktok_handle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          brand_name: string
          created_at: string | null
          id: string
          notes: string | null
          status: string
          synced_at: string | null
          talent_name: string
          updated_at: string | null
        }
        Insert: {
          brand_name: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          synced_at?: string | null
          talent_name: string
          updated_at?: string | null
        }
        Update: {
          brand_name?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          synced_at?: string | null
          talent_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gmail_tokens: {
        Row: {
          access_token: string
          created_at: string
          id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      imported_contacts: {
        Row: {
          company: string | null
          email: string | null
          full_name: string | null
          hubspot_contact_id: string | null
          id: string
          imported_at: string
          imported_by: string | null
          raw_hubspot_response: Json | null
          raw_seamless_payload: Json | null
          seamless_contact_id: string | null
          status: string
          title: string | null
        }
        Insert: {
          company?: string | null
          email?: string | null
          full_name?: string | null
          hubspot_contact_id?: string | null
          id?: string
          imported_at?: string
          imported_by?: string | null
          raw_hubspot_response?: Json | null
          raw_seamless_payload?: Json | null
          seamless_contact_id?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          company?: string | null
          email?: string | null
          full_name?: string | null
          hubspot_contact_id?: string | null
          id?: string
          imported_at?: string
          imported_by?: string | null
          raw_hubspot_response?: Json | null
          raw_seamless_payload?: Json | null
          seamless_contact_id?: string | null
          status?: string
          title?: string | null
        }
        Relationships: []
      }
      instagram_connections: {
        Row: {
          connected_by: string | null
          created_at: string
          creator_id: string | null
          id: string
          ig_business_account_id: string | null
          instagram_user_id: string
          instagram_username: string
          page_id: string | null
          page_name: string | null
          updated_at: string
        }
        Insert: {
          connected_by?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          ig_business_account_id?: string | null
          instagram_user_id: string
          instagram_username: string
          page_id?: string | null
          page_name?: string | null
          updated_at?: string
        }
        Update: {
          connected_by?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          ig_business_account_id?: string | null
          instagram_user_id?: string
          instagram_username?: string
          page_id?: string | null
          page_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_connections_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_insights: {
        Row: {
          connection_id: string
          created_at: string
          engagement_rate: number | null
          followers_count: number | null
          id: string
          impressions: number | null
          media_count: number | null
          metric_date: string
          profile_views: number | null
          raw_data: Json | null
          reach: number | null
          website_clicks: number | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          impressions?: number | null
          media_count?: number | null
          metric_date: string
          profile_views?: number | null
          raw_data?: Json | null
          reach?: number | null
          website_clicks?: number | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          impressions?: number | null
          media_count?: number | null
          metric_date?: string
          profile_views?: number | null
          raw_data?: Json | null
          reach?: number | null
          website_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_insights_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_brand_relationships: {
        Row: {
          brand_id: string
          campaign_name: string | null
          created_at: string
          creator_id: string
          deal_value: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          campaign_name?: string | null
          created_at?: string
          creator_id: string
          deal_value?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          campaign_name?: string | null
          created_at?: string
          creator_id?: string
          deal_value?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_brand_relationships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_brand_relationships_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_updates: {
        Row: {
          content: string | null
          created_at: string
          fetched_by: string | null
          id: string
          metadata: Json | null
          received_at: string
          sender: string | null
          source: string
          source_id: string | null
          subject: string | null
          talent_name: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          fetched_by?: string | null
          id?: string
          metadata?: Json | null
          received_at?: string
          sender?: string | null
          source: string
          source_id?: string | null
          subject?: string | null
          talent_name?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          fetched_by?: string | null
          id?: string
          metadata?: Json | null
          received_at?: string
          sender?: string | null
          source?: string
          source_id?: string | null
          subject?: string | null
          talent_name?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
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
    Enums: {
      app_role: ["admin", "member"],
    },
  },
} as const

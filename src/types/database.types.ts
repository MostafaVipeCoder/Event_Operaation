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
      agenda_slots: {
        Row: {
          day_id: string | null
          end_time: string | null
          presenter_name: string | null
          show_presenter: boolean | null
          slot_id: string
          slot_title: string
          sort_order: number | null
          start_time: string | null
        }
        Insert: {
          day_id?: string | null
          end_time?: string | null
          presenter_name?: string | null
          show_presenter?: boolean | null
          slot_id?: string
          slot_title: string
          sort_order?: number | null
          start_time?: string | null
        }
        Update: {
          day_id?: string | null
          end_time?: string | null
          presenter_name?: string | null
          show_presenter?: boolean | null
          slot_id?: string
          slot_title?: string
          sort_order?: number | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_slots_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["day_id"]
          },
        ]
      }
      companies: {
        Row: {
          bio: string | null
          company_id: string
          description: string | null
          employees: string | null
          event_id: string | null
          founder: string | null
          industry: string | null
          linkedin_url: string | null
          location: string | null
          logo_url: string | null
          name: string
          sector: string | null
          status: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          company_id?: string
          description?: string | null
          employees?: string | null
          event_id?: string | null
          founder?: string | null
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          sector?: string | null
          status?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          company_id?: string
          description?: string | null
          employees?: string | null
          event_id?: string | null
          founder?: string | null
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          sector?: string | null
          status?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      company_submissions: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          event_id: string | null
          form_id: string | null
          industry: string | null
          location: string | null
          logo_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          startup_name: string
          status: string | null
          submission_id: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          event_id?: string | null
          form_id?: string | null
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          startup_name: string
          status?: string | null
          submission_id?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          event_id?: string | null
          form_id?: string | null
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          startup_name?: string
          status?: string | null
          submission_id?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "company_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "event_forms"
            referencedColumns: ["form_id"]
          },
        ]
      }
      event_days: {
        Row: {
          day_date: string | null
          day_id: string
          day_name: string
          day_number: number | null
          event_id: string | null
        }
        Insert: {
          day_date?: string | null
          day_id?: string
          day_name: string
          day_number?: number | null
          event_id?: string | null
        }
        Update: {
          day_date?: string | null
          day_id?: string
          day_name?: string
          day_number?: number | null
          event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_days_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_forms: {
        Row: {
          created_at: string | null
          event_id: string | null
          form_id: string
          form_name: string
          is_active: boolean | null
          target_module: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          form_id?: string
          form_name: string
          is_active?: boolean | null
          target_module: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          form_id?: string
          form_name?: string
          is_active?: boolean | null
          target_module?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_forms_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      events: {
        Row: {
          background_image_url: string | null
          company_portal_enabled: boolean | null
          company_portal_message: string | null
          created_at: string | null
          event_id: string
          event_name: string
          expert_portal_enabled: boolean | null
          expert_portal_message: string | null
          experts_color: string | null
          font_family: string | null
          font_weight: string | null
          footer_image_url: string | null
          form_cover_image_url: string | null
          gsheets_url: string | null
          header_height: string | null
          header_image_url: string | null
          header_settings: Json | null
          overlay_opacity: string | null
          startups_color: string | null
          status: string | null
          submission_deadline: string | null
          title_size: string | null
        }
        Insert: {
          background_image_url?: string | null
          company_portal_enabled?: boolean | null
          company_portal_message?: string | null
          created_at?: string | null
          event_id?: string
          event_name: string
          expert_portal_enabled?: boolean | null
          expert_portal_message?: string | null
          experts_color?: string | null
          font_family?: string | null
          font_weight?: string | null
          footer_image_url?: string | null
          form_cover_image_url?: string | null
          gsheets_url?: string | null
          header_height?: string | null
          header_image_url?: string | null
          header_settings?: Json | null
          overlay_opacity?: string | null
          startups_color?: string | null
          status?: string | null
          submission_deadline?: string | null
          title_size?: string | null
        }
        Update: {
          background_image_url?: string | null
          company_portal_enabled?: boolean | null
          company_portal_message?: string | null
          created_at?: string | null
          event_id?: string
          event_name?: string
          expert_portal_enabled?: boolean | null
          expert_portal_message?: string | null
          experts_color?: string | null
          font_family?: string | null
          font_weight?: string | null
          footer_image_url?: string | null
          form_cover_image_url?: string | null
          gsheets_url?: string | null
          header_height?: string | null
          header_image_url?: string | null
          header_settings?: Json | null
          overlay_opacity?: string | null
          startups_color?: string | null
          status?: string | null
          submission_deadline?: string | null
          title_size?: string | null
        }
        Relationships: []
      }
      expert_submissions: {
        Row: {
          additional_data: Json | null
          bio: string | null
          company: string | null
          created_at: string | null
          event_id: string | null
          expert_name: string
          form_id: string | null
          photo_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submission_id: string
          submitted_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          additional_data?: Json | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          event_id?: string | null
          expert_name: string
          form_id?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_id?: string
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_data?: Json | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          event_id?: string | null
          expert_name?: string
          form_id?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_id?: string
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "expert_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "event_forms"
            referencedColumns: ["form_id"]
          },
        ]
      }
      experts: {
        Row: {
          bio: string | null
          company: string | null
          event_id: string | null
          expert_id: string
          linkedin_url: string | null
          location: string | null
          name: string
          photo_url: string | null
          role: string | null
          title: string | null
          twitter_url: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          event_id?: string | null
          expert_id?: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          photo_url?: string | null
          role?: string | null
          title?: string | null
          twitter_url?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          event_id?: string | null
          expert_id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          photo_url?: string | null
          role?: string | null
          title?: string | null
          twitter_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      form_field_configs: {
        Row: {
          config_id: string
          created_at: string | null
          display_order: number | null
          entity_type: string
          event_id: string | null
          field_label: string
          field_name: string
          field_options: Json | null
          field_type: string
          form_id: string | null
          help_text: string | null
          is_custom: boolean | null
          is_required: boolean | null
          placeholder: string | null
          show_in_card: boolean | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          config_id?: string
          created_at?: string | null
          display_order?: number | null
          entity_type: string
          event_id?: string | null
          field_label: string
          field_name: string
          field_options?: Json | null
          field_type: string
          form_id?: string | null
          help_text?: string | null
          is_custom?: boolean | null
          is_required?: boolean | null
          placeholder?: string | null
          show_in_card?: boolean | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          config_id?: string
          created_at?: string | null
          display_order?: number | null
          entity_type?: string
          event_id?: string | null
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_type?: string
          form_id?: string | null
          help_text?: string | null
          is_custom?: boolean | null
          is_required?: boolean | null
          placeholder?: string | null
          show_in_card?: boolean | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_field_configs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "form_field_configs_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "event_forms"
            referencedColumns: ["form_id"]
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

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
      accounts_payable: {
        Row: {
          amount: number
          bank_account_id: string | null
          category_id: string | null
          contact_id: string | null
          created_at: string
          dda_enabled: boolean | null
          deleted_at: string | null
          description: string
          due_date: string
          final_amount: number | null
          id: string
          issue_date: string | null
          notes: string | null
          original_amount: number | null
          paid_amount: number | null
          paid_at: string | null
          reference_document: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          dda_enabled?: boolean | null
          deleted_at?: string | null
          description: string
          due_date: string
          final_amount?: number | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          paid_amount?: number | null
          paid_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          dda_enabled?: boolean | null
          deleted_at?: string | null
          description?: string
          due_date?: string
          final_amount?: number | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          paid_amount?: number | null
          paid_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "active_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "active_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "active_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "accounts_payable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          bank_account_id: string | null
          category_id: string | null
          contact_id: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          deleted_at: string | null
          description: string
          due_date: string
          final_amount: number | null
          id: string
          issue_date: string | null
          notes: string | null
          original_amount: number | null
          received_amount: number | null
          received_at: string | null
          reference_document: string | null
          status: Database["public"]["Enums"]["receivable_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          deleted_at?: string | null
          description: string
          due_date: string
          final_amount?: number | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          received_amount?: number | null
          received_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["receivable_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          deleted_at?: string | null
          description?: string
          due_date?: string
          final_amount?: number | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          received_amount?: number | null
          received_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["receivable_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "active_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "active_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "active_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "active_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "accounts_receivable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          deleted_at: string | null
          id: string
          ip: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          ip?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          ip?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          bank_id: string
          created_at: string
          deleted_at: string | null
          id: string
          pix_key: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          bank_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          pix_key?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          bank_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          pix_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "active_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          initial_balance: number
          name: string
          type: Database["public"]["Enums"]["bank_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          initial_balance?: number
          name: string
          type?: Database["public"]["Enums"]["bank_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          initial_balance?: number
          name?: string
          type?: Database["public"]["Enums"]["bank_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "banks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          deleted_at: string | null
          group_name: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          group_name?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          group_name?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contacts: {
        Row: {
          active: boolean
          address: string | null
          category_id: string | null
          city: string | null
          created_at: string
          deleted_at: string | null
          document: string | null
          document_type: string | null
          email: string | null
          id: string
          metadata: Json
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          type: string
          updated_at: string
          user_id: string
          whatsapp: string | null
          zip: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
          zip?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "active_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      customers: {
        Row: {
          active: boolean
          address: string | null
          city: string | null
          created_at: string
          deleted_at: string | null
          document: string | null
          document_type: string | null
          email: string | null
          id: string
          metadata: Json
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          type: string
          updated_at: string
          user_id: string
          whatsapp: string | null
          zip: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
          zip?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          data: Json | null
          deleted_at: string | null
          delivered_at: string | null
          id: string
          message: string
          read_at: string | null
          scheduled_for: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          scheduled_for?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          scheduled_for?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          deleted_at: string | null
          endereco: string | null
          estado: string | null
          features_limit: Json
          id: string
          last_login: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string
          phone_verified: boolean | null
          plan: Database["public"]["Enums"]["user_plan"]
          role: Database["public"]["Enums"]["app_role"]
          security_config: Json | null
          subscription_ends_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          deleted_at?: string | null
          endereco?: string | null
          estado?: string | null
          features_limit?: Json
          id?: string
          last_login?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone: string
          phone_verified?: boolean | null
          plan?: Database["public"]["Enums"]["user_plan"]
          role?: Database["public"]["Enums"]["app_role"]
          security_config?: Json | null
          subscription_ends_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          deleted_at?: string | null
          endereco?: string | null
          estado?: string | null
          features_limit?: Json
          id?: string
          last_login?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string
          phone_verified?: boolean | null
          plan?: Database["public"]["Enums"]["user_plan"]
          role?: Database["public"]["Enums"]["app_role"]
          security_config?: Json | null
          subscription_ends_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events_archive: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          currency: string
          date_format: string
          deleted_at: string | null
          extras: Json
          id: string
          items_per_page: number
          locale: string
          notifications: Json
          number_format: string
          start_page: string
          theme: Database["public"]["Enums"]["theme_mode"]
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          date_format?: string
          deleted_at?: string | null
          extras?: Json
          id?: string
          items_per_page?: number
          locale?: string
          notifications?: Json
          number_format?: string
          start_page?: string
          theme?: Database["public"]["Enums"]["theme_mode"]
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          date_format?: string
          deleted_at?: string | null
          extras?: Json
          id?: string
          items_per_page?: number
          locale?: string
          notifications?: Json
          number_format?: string
          start_page?: string
          theme?: Database["public"]["Enums"]["theme_mode"]
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          status: string
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: string
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: string
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          created_at: string | null
          deleted_at: string | null
          document: string | null
          document_type: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          accounts_payable_id: string | null
          accounts_receivable_id: string | null
          amount: number
          created_at: string
          date: string
          deleted_at: string | null
          description: string | null
          from_account_id: string | null
          id: string
          notes: string | null
          reference_id: string | null
          to_account_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accounts_payable_id?: string | null
          accounts_receivable_id?: string | null
          amount: number
          created_at?: string
          date: string
          deleted_at?: string | null
          description?: string | null
          from_account_id?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          to_account_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accounts_payable_id?: string | null
          accounts_receivable_id?: string | null
          amount?: number
          created_at?: string
          date?: string
          deleted_at?: string | null
          description?: string | null
          from_account_id?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          to_account_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_accounts_payable_id_fkey"
            columns: ["accounts_payable_id"]
            isOneToOne: false
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_accounts_payable_id_fkey"
            columns: ["accounts_payable_id"]
            isOneToOne: false
            referencedRelation: "active_accounts_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_accounts_receivable_id_fkey"
            columns: ["accounts_receivable_id"]
            isOneToOne: false
            referencedRelation: "accounts_receivable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_accounts_receivable_id_fkey"
            columns: ["accounts_receivable_id"]
            isOneToOne: false
            referencedRelation: "active_accounts_receivable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "active_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "active_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      active_accounts_payable: {
        Row: {
          amount: number | null
          bank_account_id: string | null
          category_id: string | null
          contact_id: string | null
          created_at: string | null
          dda_enabled: boolean | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          final_amount: number | null
          id: string | null
          issue_date: string | null
          notes: string | null
          original_amount: number | null
          paid_amount: number | null
          paid_at: string | null
          reference_document: string | null
          status: Database["public"]["Enums"]["account_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          dda_enabled?: boolean | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          final_amount?: number | null
          id?: string | null
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          paid_amount?: number | null
          paid_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          dda_enabled?: boolean | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          final_amount?: number | null
          id?: string | null
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          paid_amount?: number | null
          paid_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "active_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "active_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "active_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "accounts_payable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      active_accounts_receivable: {
        Row: {
          amount: number | null
          bank_account_id: string | null
          category_id: string | null
          contact_id: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          final_amount: number | null
          id: string | null
          issue_date: string | null
          notes: string | null
          original_amount: number | null
          received_amount: number | null
          received_at: string | null
          reference_document: string | null
          status: Database["public"]["Enums"]["receivable_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          final_amount?: number | null
          id?: string | null
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          received_amount?: number | null
          received_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["receivable_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          bank_account_id?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          final_amount?: number | null
          id?: string | null
          issue_date?: string | null
          notes?: string | null
          original_amount?: number | null
          received_amount?: number | null
          received_at?: string | null
          reference_document?: string | null
          status?: Database["public"]["Enums"]["receivable_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "active_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "active_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "active_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "active_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "accounts_receivable_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      active_bank_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          bank_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          pix_key: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          bank_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          pix_key?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          bank_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          pix_key?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "active_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      active_banks: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          initial_balance: number | null
          name: string | null
          type: Database["public"]["Enums"]["bank_type"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          initial_balance?: number | null
          name?: string | null
          type?: Database["public"]["Enums"]["bank_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          initial_balance?: number | null
          name?: string | null
          type?: Database["public"]["Enums"]["bank_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "banks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      active_categories: {
        Row: {
          color: string | null
          created_at: string | null
          deleted_at: string | null
          group_name: string | null
          icon: string | null
          id: string | null
          is_system: boolean | null
          name: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          group_name?: string | null
          icon?: string | null
          id?: string | null
          is_system?: boolean | null
          name?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          group_name?: string | null
          icon?: string | null
          id?: string | null
          is_system?: boolean | null
          name?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      active_contacts: {
        Row: {
          active: boolean | null
          address: string | null
          category_id: string | null
          city: string | null
          created_at: string | null
          deleted_at: string | null
          document: string | null
          document_type: string | null
          email: string | null
          id: string | null
          metadata: Json | null
          name: string | null
          notes: string | null
          phone: string | null
          state: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
          zip: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
          zip?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "active_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      active_customers: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          created_at: string | null
          deleted_at: string | null
          document: string | null
          document_type: string | null
          email: string | null
          id: string | null
          metadata: Json | null
          name: string | null
          notes: string | null
          phone: string | null
          state: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
          zip: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
          zip?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_summary_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      active_suppliers: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          created_at: string | null
          deleted_at: string | null
          document: string | null
          document_type: string | null
          email: string | null
          id: string | null
          name: string | null
          notes: string | null
          phone: string | null
          state: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          zip: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      user_summary_stats: {
        Row: {
          total_accounts_payable: number | null
          total_accounts_receivable: number | null
          total_banks: number | null
          total_categories: number | null
          total_customers: number | null
          total_suppliers: number | null
          user_id: string | null
        }
        Insert: {
          total_accounts_payable?: never
          total_accounts_receivable?: never
          total_banks?: never
          total_categories?: never
          total_customers?: never
          total_suppliers?: never
          user_id?: string | null
        }
        Update: {
          total_accounts_payable?: never
          total_accounts_receivable?: never
          total_banks?: never
          total_categories?: never
          total_customers?: never
          total_suppliers?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_feature_limit: {
        Args: { _current_count: number; _feature: string; _user_id: string }
        Returns: boolean
      }
      cleanup_old_deleted_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_scheduled_for?: string
          p_severity?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: {
          channel: string
          created_at: string
          data: Json | null
          deleted_at: string | null
          delivered_at: string | null
          id: string
          message: string
          read_at: string | null
          scheduled_for: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
      }
      create_trial_subscription: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          status: string
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
      }
      dismiss_notification: {
        Args: { p_notification_id: string }
        Returns: {
          channel: string
          created_at: string
          data: Json | null
          deleted_at: string | null
          delivered_at: string | null
          id: string
          message: string
          read_at: string | null
          scheduled_for: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
      }
      get_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          deleted_at: string | null
          endereco: string | null
          estado: string | null
          features_limit: Json
          id: string
          last_login: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string
          phone_verified: boolean | null
          plan: Database["public"]["Enums"]["user_plan"]
          role: Database["public"]["Enums"]["app_role"]
          security_config: Json | null
          subscription_ends_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_action"]
          p_metadata?: Json
          p_new_data?: Json
          p_old_data?: Json
          p_record_id?: string
          p_table_name?: string
        }
        Returns: string
      }
      mark_all_notifications_read: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: {
          channel: string
          created_at: string
          data: Json | null
          deleted_at: string | null
          delivered_at: string | null
          id: string
          message: string
          read_at: string | null
          scheduled_for: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
      }
      normalize_subscription_status: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          status: string
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
      }
      restore_deleted_record: {
        Args: { p_record_id: string; p_table_name: string; p_user_id?: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      soft_delete_record: {
        Args: { p_record_id: string; p_table_name: string; p_user_id?: string }
        Returns: boolean
      }
      update_security_config: {
        Args: { p_config: Json }
        Returns: {
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          deleted_at: string | null
          endereco: string | null
          estado: string | null
          features_limit: Json
          id: string
          last_login: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string
          phone_verified: boolean | null
          plan: Database["public"]["Enums"]["user_plan"]
          role: Database["public"]["Enums"]["app_role"]
          security_config: Json | null
          subscription_ends_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
      }
      update_user_profile: {
        Args: {
          p_avatar_url?: string
          p_bio?: string
          p_cep?: string
          p_cidade?: string
          p_endereco?: string
          p_estado?: string
          p_name?: string
          p_phone?: string
          p_whatsapp?: string
        }
        Returns: {
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          deleted_at: string | null
          endereco: string | null
          estado: string | null
          features_limit: Json
          id: string
          last_login: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string
          phone_verified: boolean | null
          plan: Database["public"]["Enums"]["user_plan"]
          role: Database["public"]["Enums"]["app_role"]
          security_config: Json | null
          subscription_ends_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
      }
      upsert_profile: {
        Args: {
          p_email?: string
          p_name?: string
          p_phone: string
          p_user_id: string
        }
        Returns: {
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          deleted_at: string | null
          endereco: string | null
          estado: string | null
          features_limit: Json
          id: string
          last_login: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string
          phone_verified: boolean | null
          plan: Database["public"]["Enums"]["user_plan"]
          role: Database["public"]["Enums"]["app_role"]
          security_config: Json | null
          subscription_ends_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
      }
      upsert_settings: {
        Args: { p_patch: Json }
        Returns: {
          created_at: string
          currency: string
          date_format: string
          deleted_at: string | null
          extras: Json
          id: string
          items_per_page: number
          locale: string
          notifications: Json
          number_format: string
          start_page: string
          theme: Database["public"]["Enums"]["theme_mode"]
          timezone: string
          updated_at: string
          user_id: string
        }
      }
      verify_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
    }
    Enums: {
      account_status: "pending" | "paid" | "overdue" | "canceled"
      app_role: "admin" | "user"
      audit_action:
        | "login"
        | "logout"
        | "create"
        | "update"
        | "delete"
        | "read"
        | "error"
        | "other"
      bank_type: "banco" | "carteira" | "outro" | "corretora" | "cripto"
      notification_severity: "info" | "success" | "warning" | "error"
      notification_status: "pending" | "sent" | "read" | "dismissed" | "error"
      notification_type:
        | "bill_due_soon"
        | "bill_overdue"
        | "trial_expiring"
        | "payment_failed"
        | "subscription_expired"
        | "info"
        | "system"
      receivable_status: "pending" | "received" | "overdue" | "canceled"
      subscription_status: "active" | "inactive" | "cancelled" | "expired"
      theme_mode: "system" | "light" | "dark"
      theme_type: "light"
      transaction_type: "income" | "expense" | "transfer"
      user_plan: "trial" | "free" | "premium"
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
      account_status: ["pending", "paid", "overdue", "canceled"],
      app_role: ["admin", "user"],
      audit_action: [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "read",
        "error",
        "other",
      ],
      bank_type: ["banco", "carteira", "outro", "corretora", "cripto"],
      notification_severity: ["info", "success", "warning", "error"],
      notification_status: ["pending", "sent", "read", "dismissed", "error"],
      notification_type: [
        "bill_due_soon",
        "bill_overdue",
        "trial_expiring",
        "payment_failed",
        "subscription_expired",
        "info",
        "system",
      ],
      receivable_status: ["pending", "received", "overdue", "canceled"],
      subscription_status: ["active", "inactive", "cancelled", "expired"],
      theme_mode: ["system", "light", "dark"],
      theme_type: ["light"],
      transaction_type: ["income", "expense", "transfer"],
      user_plan: ["trial", "free", "premium"],
    },
  },
} as const

// Types générés depuis le schéma Supabase.
// À régénérer avec : npx supabase gen types typescript --project-id <id> > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType =
  | 'mission_reward'
  | 'manual_deposit'
  | 'manual_withdrawal'
  | 'goal_purchase';

export type MissionStatus = 'pending' | 'completed' | 'validated' | 'rejected';
export type AchievementType = 'badge' | 'avatar' | 'theme';
export type ComplianceEventType =
  | 'consent_given'
  | 'account_created'
  | 'account_deleted'
  | 'data_exported'
  | 'pin_changed';

export interface Database {
  public: {
    Tables: {
      parents: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          username?: string | null;
          settings?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      consents: {
        Row: {
          id: string;
          parent_id: string;
          consent_version: string;
          consent_text: string;
          consent_method: string;
          email: string;
          ip_address: string | null;
          user_agent: string | null;
          consented_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          consent_version: string;
          consent_text: string;
          consent_method: string;
          email: string;
          ip_address?: string | null;
          user_agent?: string | null;
          consented_at?: string;
        };
        Update: never; // immuable
        Relationships: [];
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          pseudonym: string;
          birth_year: number | null;
          child_pin_hash: string | null;
          child_pin_updated_at: string | null;
          avatar_id: string;
          theme_id: string;
          level: number;
          experience: number;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          pseudonym: string;
          birth_year?: number | null;
          child_pin_hash?: string | null;
          child_pin_updated_at?: string | null;
          avatar_id?: string;
          theme_id?: string;
          level?: number;
          experience?: number;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pseudonym?: string;
          birth_year?: number | null;
          child_pin_hash?: string | null;
          child_pin_updated_at?: string | null;
          avatar_id?: string;
          theme_id?: string;
          level?: number;
          experience?: number;
          settings?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          child_id: string;
          type: TransactionType;
          amount: number;
          description: string;
          reference_id: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          child_id: string;
          type: TransactionType;
          amount: number;
          description: string;
          reference_id?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: never; // ledger immuable
        Relationships: [];
      };
      missions: {
        Row: {
          id: string;
          parent_id: string;
          child_id: string;
          title: string;
          description: string | null;
          reward: number;
          status: MissionStatus;
          created_at: string;
          completed_at: string | null;
          validated_at: string | null;
          validated_by: string | null;
        };
        Insert: {
          id?: string;
          parent_id: string;
          child_id: string;
          title: string;
          description?: string | null;
          reward: number;
          status?: MissionStatus;
          created_at?: string;
          completed_at?: string | null;
          validated_at?: string | null;
          validated_by?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          reward?: number;
          status?: MissionStatus;
          completed_at?: string | null;
          validated_at?: string | null;
          validated_by?: string | null;
        };
        Relationships: [];
      };
      wishlists: {
        Row: {
          id: string;
          child_id: string;
          product_name: string;
          product_image_url: string | null;
          product_price: number;
          product_currency: string;
          product_source: string | null;
          product_ref: string | null;
          added_at: string;
          purchased_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          child_id: string;
          product_name: string;
          product_image_url?: string | null;
          product_price: number;
          product_currency?: string;
          product_source?: string | null;
          product_ref?: string | null;
          added_at?: string;
          purchased_at?: string | null;
          notes?: string | null;
        };
        Update: {
          product_name?: string;
          product_image_url?: string | null;
          product_price?: number;
          purchased_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          child_id: string;
          type: AchievementType;
          item_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          type: AchievementType;
          item_id: string;
          unlocked_at?: string;
        };
        Update: never; // immuable
        Relationships: [];
      };
      compliance_logs: {
        Row: {
          id: string;
          type: ComplianceEventType;
          user_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: ComplianceEventType;
          user_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      child_balances: {
        Row: { child_id: string; balance: number };
        Relationships: [];
      };
      wishlist_progress: {
        Row: {
          id: string;
          child_id: string;
          product_name: string;
          product_image_url: string | null;
          product_price: number;
          product_currency: string;
          current_balance: number;
          progress_percent: number;
          can_afford: boolean;
        };
        Relationships: [];
      };
    };
    Functions: {
      delete_child_account: {
        Args: {
          child_uuid: string;
        };
        Returns: undefined;
      };
      delete_parent_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      set_child_pin: {
        Args: {
          child_uuid: string;
          plain_pin: string;
        };
        Returns: undefined;
      };
      verify_child_pin_anon: {
        Args: {
          p_pseudonym: string;
          p_pin: string;
        };
        Returns: Record<string, unknown>;
      };
      get_child_data_anon: {
        Args: {
          p_child_id: string;
        };
        Returns: Record<string, unknown>;
      };
      child_add_wish_anon: {
        Args: {
          p_child_id: string;
          p_name: string;
          p_price: number;
          p_image_url: string | null;
        };
        Returns: Record<string, unknown>;
      };
    };
    Enums: {
      transaction_type: TransactionType;
      mission_status: MissionStatus;
      achievement_type: AchievementType;
    };
  };
}

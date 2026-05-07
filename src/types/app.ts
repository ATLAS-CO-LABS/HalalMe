export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ai_chat_sessions: {
        Row: {
          created_at: string;
          id: string;
          ingredients: string[] | null;
          messages: Json;
          recipe_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingredients?: string[] | null;
          messages?: Json;
          recipe_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ingredients?: string[] | null;
          messages?: Json;
          recipe_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_request_counts: {
        Row: {
          request_count: number;
          user_id: string;
          window_start: string;
        };
        Insert: {
          request_count?: number;
          user_id: string;
          window_start?: string;
        };
        Update: {
          request_count?: number;
          user_id?: string;
          window_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_request_counts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      charities: {
        Row: {
          category: string;
          charity_type: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          country: string;
          created_at: string;
          currency: string;
          description: string;
          document_paths: Json;
          donor_count: number;
          goal_amount: number;
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          is_zakat_eligible: boolean;
          legal_name: string | null;
          long_description: string | null;
          minimum_donation: number;
          name: string;
          platform_fee_pct: number;
          raised_amount: number;
          registration_number: string | null;
          rejection_reason: string | null;
          slug: string;
          stripe_account_id: string | null;
          stripe_charges_enabled: boolean;
          stripe_country: string | null;
          stripe_default_currency: string | null;
          stripe_last_synced_at: string | null;
          stripe_onboarding_sent_at: string | null;
          stripe_onboarding_status: string;
          stripe_onboarding_url: string | null;
          stripe_onboarding_url_expires_at: string | null;
          stripe_payouts_enabled: boolean;
          submitted_by: string | null;
          updated_at: string;
          verification_status: string;
          verified_at: string | null;
          verified_by: string | null;
          website_url: string | null;
        };
        Insert: {
          category: string;
          charity_type?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          country?: string;
          created_at?: string;
          currency?: string;
          description: string;
          document_paths?: Json;
          donor_count?: number;
          goal_amount: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          is_zakat_eligible?: boolean;
          legal_name?: string | null;
          long_description?: string | null;
          minimum_donation?: number;
          name: string;
          platform_fee_pct?: number;
          raised_amount?: number;
          registration_number?: string | null;
          rejection_reason?: string | null;
          slug: string;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean;
          stripe_country?: string | null;
          stripe_default_currency?: string | null;
          stripe_last_synced_at?: string | null;
          stripe_onboarding_sent_at?: string | null;
          stripe_onboarding_status?: string;
          stripe_onboarding_url?: string | null;
          stripe_onboarding_url_expires_at?: string | null;
          stripe_payouts_enabled?: boolean;
          submitted_by?: string | null;
          updated_at?: string;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          website_url?: string | null;
        };
        Update: {
          category?: string;
          charity_type?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          country?: string;
          created_at?: string;
          currency?: string;
          description?: string;
          document_paths?: Json;
          donor_count?: number;
          goal_amount?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          is_zakat_eligible?: boolean;
          legal_name?: string | null;
          long_description?: string | null;
          minimum_donation?: number;
          name?: string;
          platform_fee_pct?: number;
          raised_amount?: number;
          registration_number?: string | null;
          rejection_reason?: string | null;
          slug?: string;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean;
          stripe_country?: string | null;
          stripe_default_currency?: string | null;
          stripe_last_synced_at?: string | null;
          stripe_onboarding_sent_at?: string | null;
          stripe_onboarding_status?: string;
          stripe_onboarding_url?: string | null;
          stripe_onboarding_url_expires_at?: string | null;
          stripe_payouts_enabled?: boolean;
          submitted_by?: string | null;
          updated_at?: string;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "charities_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charities_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      charity_applications: {
        Row: {
          applicant_user_id: string;
          category: string;
          charity_id: string | null;
          charity_type: string;
          contact_email: string;
          contact_phone: string | null;
          country: string;
          created_at: string;
          description: string;
          display_name: string;
          document_paths: Json;
          id: string;
          is_zakat_eligible: boolean;
          legal_name: string;
          registration_number: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewer_notes: string | null;
          status: string;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          applicant_user_id: string;
          category: string;
          charity_id?: string | null;
          charity_type: string;
          contact_email: string;
          contact_phone?: string | null;
          country: string;
          created_at?: string;
          description: string;
          display_name: string;
          document_paths?: Json;
          id?: string;
          is_zakat_eligible?: boolean;
          legal_name: string;
          registration_number: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          applicant_user_id?: string;
          category?: string;
          charity_id?: string | null;
          charity_type?: string;
          contact_email?: string;
          contact_phone?: string | null;
          country?: string;
          created_at?: string;
          description?: string;
          display_name?: string;
          document_paths?: Json;
          id?: string;
          is_zakat_eligible?: boolean;
          legal_name?: string;
          registration_number?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "charity_applications_applicant_user_id_fkey";
            columns: ["applicant_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charity_applications_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charity_applications_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charity_stripe_status";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charity_applications_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comment_likes: {
        Row: {
          comment_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          like_count: number;
          parent_id: string | null;
          post_id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          like_count?: number;
          parent_id?: string | null;
          post_id: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          like_count?: number;
          parent_id?: string | null;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "following_posts_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      donations: {
        Row: {
          amount: number;
          application_fee_amount: number | null;
          charity_id: string;
          created_at: string;
          currency: string;
          id: string;
          idempotency_key: string;
          ip_address: unknown;
          is_anonymous: boolean;
          message: string | null;
          net_amount: number | null;
          payment_intent_id: string | null;
          payment_method_type: string | null;
          payment_provider: string;
          payment_ref: string | null;
          platform_fee_amount: number | null;
          points_earned: number;
          receipt_sent_at: string | null;
          receipt_url: string | null;
          refund_ref: string | null;
          refunded_at: string | null;
          risk_score: number;
          status: string;
          stripe_charge_id: string | null;
          stripe_fee_amount: number | null;
          stripe_transfer_id: string | null;
          updated_at: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          application_fee_amount?: number | null;
          charity_id: string;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key: string;
          ip_address?: unknown;
          is_anonymous?: boolean;
          message?: string | null;
          net_amount?: number | null;
          payment_intent_id?: string | null;
          payment_method_type?: string | null;
          payment_provider?: string;
          payment_ref?: string | null;
          platform_fee_amount?: number | null;
          points_earned?: number;
          receipt_sent_at?: string | null;
          receipt_url?: string | null;
          refund_ref?: string | null;
          refunded_at?: string | null;
          risk_score?: number;
          status?: string;
          stripe_charge_id?: string | null;
          stripe_fee_amount?: number | null;
          stripe_transfer_id?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          application_fee_amount?: number | null;
          charity_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key?: string;
          ip_address?: unknown;
          is_anonymous?: boolean;
          message?: string | null;
          net_amount?: number | null;
          payment_intent_id?: string | null;
          payment_method_type?: string | null;
          payment_provider?: string;
          payment_ref?: string | null;
          platform_fee_amount?: number | null;
          points_earned?: number;
          receipt_sent_at?: string | null;
          receipt_url?: string | null;
          refund_ref?: string | null;
          refunded_at?: string | null;
          risk_score?: number;
          status?: string;
          stripe_charge_id?: string | null;
          stripe_fee_amount?: number | null;
          stripe_transfer_id?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "donations_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donations_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charity_stripe_status";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          actor_id: string;
          comment_id: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          post_id: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          actor_id: string;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          post_id?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          actor_id?: string;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          post_id?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "following_posts_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_bookmarks: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "following_posts_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_bookmarks_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_likes: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "following_posts_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          comment_count: number;
          content: string;
          created_at: string;
          id: string;
          is_published: boolean;
          like_count: number;
          media_urls: string[] | null;
          post_type: string;
          recipe_id: string | null;
          updated_at: string;
          user_id: string;
          view_count: number;
        };
        Insert: {
          comment_count?: number;
          content: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          like_count?: number;
          media_urls?: string[] | null;
          post_type?: string;
          recipe_id?: string | null;
          updated_at?: string;
          user_id: string;
          view_count?: number;
        };
        Update: {
          comment_count?: number;
          content?: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          like_count?: number;
          media_urls?: string[] | null;
          post_type?: string;
          recipe_id?: string | null;
          updated_at?: string;
          user_id?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "posts_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          full_name: string;
          id: string;
          is_verified: boolean;
          location: string | null;
          reward_points: number;
          reward_tier: string;
          role: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name: string;
          id: string;
          is_verified?: boolean;
          location?: string | null;
          reward_points?: number;
          reward_tier?: string;
          role?: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_verified?: boolean;
          location?: string | null;
          reward_points?: number;
          reward_tier?: string;
          role?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      recipe_favorites: {
        Row: {
          created_at: string;
          recipe_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          recipe_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          recipe_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_favorites_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          recipe_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          recipe_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          recipe_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          avg_rating: number | null;
          cook_time_mins: number | null;
          created_at: string;
          cuisine: string | null;
          description: string | null;
          difficulty: string | null;
          id: string;
          image_url: string | null;
          ingredients: Json;
          instructions: Json;
          is_ai_generated: boolean;
          is_halal_verified: boolean;
          is_published: boolean;
          nutrition: Json | null;
          prep_time_mins: number | null;
          review_count: number;
          servings: number | null;
          tags: string[] | null;
          title: string;
          updated_at: string;
          user_id: string;
          view_count: number;
        };
        Insert: {
          avg_rating?: number | null;
          cook_time_mins?: number | null;
          created_at?: string;
          cuisine?: string | null;
          description?: string | null;
          difficulty?: string | null;
          id?: string;
          image_url?: string | null;
          ingredients?: Json;
          instructions?: Json;
          is_ai_generated?: boolean;
          is_halal_verified?: boolean;
          is_published?: boolean;
          nutrition?: Json | null;
          prep_time_mins?: number | null;
          review_count?: number;
          servings?: number | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          user_id: string;
          view_count?: number;
        };
        Update: {
          avg_rating?: number | null;
          cook_time_mins?: number | null;
          created_at?: string;
          cuisine?: string | null;
          description?: string | null;
          difficulty?: string | null;
          id?: string;
          image_url?: string | null;
          ingredients?: Json;
          instructions?: Json;
          is_ai_generated?: boolean;
          is_halal_verified?: boolean;
          is_published?: boolean;
          nutrition?: Json | null;
          prep_time_mins?: number | null;
          review_count?: number;
          servings?: number | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reward_rules: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          is_active: boolean;
          label: string;
          max_lifetime: number | null;
          max_per_day: number | null;
          points_per_unit: number;
          unit: string;
          updated_at: string;
          valid_from: string;
          valid_until: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label: string;
          max_lifetime?: number | null;
          max_per_day?: number | null;
          points_per_unit: number;
          unit?: string;
          updated_at?: string;
          valid_from?: string;
          valid_until?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          max_lifetime?: number | null;
          max_per_day?: number | null;
          points_per_unit?: number;
          unit?: string;
          updated_at?: string;
          valid_from?: string;
          valid_until?: string | null;
        };
        Relationships: [];
      };
      reward_tiers: {
        Row: {
          ai_requests_per_hour: number;
          color: string;
          min_points: number;
          name: string;
          sort_order: number;
        };
        Insert: {
          ai_requests_per_hour?: number;
          color: string;
          min_points: number;
          name: string;
          sort_order: number;
        };
        Update: {
          ai_requests_per_hour?: number;
          color?: string;
          min_points?: number;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      reward_transactions: {
        Row: {
          action: string;
          created_at: string;
          created_date: string;
          description: string | null;
          expires_at: string | null;
          id: string;
          is_expired: boolean;
          points: number;
          redeemed_at: string | null;
          redemption_ref: string | null;
          reference_id: string | null;
          source_donation_id: string | null;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          created_date?: string;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_expired?: boolean;
          points: number;
          redeemed_at?: string | null;
          redemption_ref?: string | null;
          reference_id?: string | null;
          source_donation_id?: string | null;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          created_date?: string;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_expired?: boolean;
          points?: number;
          redeemed_at?: string | null;
          redemption_ref?: string | null;
          reference_id?: string | null;
          source_donation_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reward_transactions_source_donation_id_fkey";
            columns: ["source_donation_id"];
            isOneToOne: false;
            referencedRelation: "donations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reward_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_connect_events: {
        Row: {
          charity_id: string | null;
          created_at: string;
          event_id: string;
          event_type: string;
          id: string;
          payload: Json;
          processed_at: string | null;
          processing_error: string | null;
          stripe_account_id: string | null;
        };
        Insert: {
          charity_id?: string | null;
          created_at?: string;
          event_id: string;
          event_type: string;
          id?: string;
          payload: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          stripe_account_id?: string | null;
        };
        Update: {
          charity_id?: string | null;
          created_at?: string;
          event_id?: string;
          event_type?: string;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          stripe_account_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stripe_connect_events_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stripe_connect_events_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charity_stripe_status";
            referencedColumns: ["id"];
          },
        ];
      };
      user_badges: {
        Row: {
          award_reason: string | null;
          awarded_at: string;
          badge_slug: string;
          id: string;
          user_id: string;
        };
        Insert: {
          award_reason?: string | null;
          awarded_at?: string;
          badge_slug: string;
          id?: string;
          user_id: string;
        };
        Update: {
          award_reason?: string | null;
          awarded_at?: string;
          badge_slug?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          created_at: string;
          event_id: string;
          event_type: string;
          id: string;
          payload: Json;
          processed_at: string | null;
          processing_error: string | null;
          provider: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          event_type: string;
          id?: string;
          payload: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          provider?: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          event_type?: string;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          provider?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      charity_stripe_status: {
        Row: {
          can_accept_donations: boolean | null;
          connect_status: string | null;
          id: string | null;
          name: string | null;
          slug: string | null;
          stripe_account_id: string | null;
          stripe_charges_enabled: boolean | null;
          stripe_last_synced_at: string | null;
          stripe_onboarding_sent_at: string | null;
          stripe_onboarding_status: string | null;
          stripe_payouts_enabled: boolean | null;
          verification_status: string | null;
        };
        Insert: {
          can_accept_donations?: never;
          connect_status?: never;
          id?: string | null;
          name?: string | null;
          slug?: string | null;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_last_synced_at?: string | null;
          stripe_onboarding_sent_at?: string | null;
          stripe_onboarding_status?: string | null;
          stripe_payouts_enabled?: boolean | null;
          verification_status?: string | null;
        };
        Update: {
          can_accept_donations?: never;
          connect_status?: never;
          id?: string | null;
          name?: string | null;
          slug?: string | null;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_last_synced_at?: string | null;
          stripe_onboarding_sent_at?: string | null;
          stripe_onboarding_status?: string | null;
          stripe_payouts_enabled?: boolean | null;
          verification_status?: string | null;
        };
        Relationships: [];
      };
      following_posts_view: {
        Row: {
          comment_count: number | null;
          content: string | null;
          created_at: string | null;
          follower_id: string | null;
          id: string | null;
          is_published: boolean | null;
          like_count: number | null;
          media_urls: string[] | null;
          post_type: string | null;
          profiles: Json | null;
          recipe_id: string | null;
          updated_at: string | null;
          user_id: string | null;
          view_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      award_badge: {
        Args: { p_badge_slug: string; p_reason?: string; p_user_id: string };
        Returns: undefined;
      };
      check_and_award_badges:
        | { Args: { p_user_id: string }; Returns: undefined }
        | {
            Args: {
              p_extra_amount?: number;
              p_extra_count?: number;
              p_user_id: string;
            };
            Returns: undefined;
          };
      decrement_reward_points: {
        Args: { p_points: number; p_user_id: string };
        Returns: undefined;
      };
      increment_post_view: { Args: { p_post_id: string }; Returns: undefined };
      recalculate_user_rewards: { Args: { p_user_id: string }; Returns: Json };
      release_flagged_rewards: {
        Args: { p_donation_id: string };
        Returns: Json;
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      unaccent: { Args: { "": string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

// =============================================================================
// Hand-written app types
// =============================================================================

export interface Charity {
  id:                  string;
  name:                string;
  slug:                string;
  description:         string;
  category:            string;
  image_url:           string | null;
  raised_amount:       number;
  donor_count:         number;
  goal_amount:         number | null;
  currency:            string;
  minimum_donation:    number;
  platform_fee_pct:    number;
  is_active:           boolean;
  is_featured:         boolean;
  verification_status: string;
  stripe_account_id:   string | null;
  stripe_charges_enabled: boolean;
  created_at:          string;
}

export interface Donation {
  id:                  string;
  user_id:             string;
  charity_id:          string;
  amount:              number;
  currency:            string;
  status:              "pending" | "completed" | "failed" | "refunded";
  points_earned:       number;
  message:             string | null;
  is_anonymous:        boolean;
  payment_intent_id:   string | null;
  payment_ref:         string | null;
  payment_method_type: string | null;
  risk_score:          number;
  created_at:          string;
  updated_at:          string;
  charities?:          { name: string; slug: string; image_url: string | null } | null;
}

export interface RewardTransaction {
  id:                 string;
  user_id:            string;
  points:             number;
  action:             string;
  description:        string | null;
  source_donation_id: string | null;
  expires_at:         string | null;
  created_at:         string;
}

export interface UserBadge {
  id:           string;
  user_id:      string;
  badge_slug:   string;
  awarded_at:   string;
  award_reason: string | null;
}

export type PostType = "general" | "recipe" | "question" | "review";

export interface AIMessage {
  role:      "user" | "assistant";
  content:   string | Record<string, unknown>;
  timestamp?: string;
}

export interface AIAssistantResponse {
  type:               "chat" | "recipe";
  message:            string;
  recipe:             {
    title:          string;
    description:    string;
    cuisine:        string;
    difficulty:     "easy" | "medium" | "hard";
    prep_time_mins: number;
    cook_time_mins: number;
    servings:       number;
    ingredients:    { name: string; amount: string; unit: string }[];
    instructions:   { step: number; text: string }[];
    tags:           string[];
    nutrition:      { calories: number; protein: number; carbs: number; fat: number };
  } | null;
  recipe_id?:          string | null;
  is_saved?:           boolean;
  session_id?:         string | null;
  requests_remaining?: number;
}

export interface UserSearchResult {
  id:          string;
  username:    string | null;
  full_name:   string | null;
  avatar_url:  string | null;
  is_verified: boolean | null;
  bio:         string | null;
}

export interface Comment {
  id:         string;
  post_id:    string;
  user_id:    string;
  parent_id:  string | null;
  content:    string;
  like_count: number;
  created_at: string;
  is_liked?:  boolean;
  replies?:   Comment[];
  profiles?: {
    username:   string | null;
    avatar_url: string | null;
  } | null;
}

export interface Notification {
  id:         string;
  user_id:    string;
  actor_id:   string;
  type:       string;
  post_id:    string | null;
  comment_id: string | null;
  is_read:    boolean;
  created_at: string;
  actor?: {
    username:  string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface PaginatedResult<T> {
  data:     T[];
  count:    number;
  page:     number;
  pageSize: number;
  hasMore:  boolean;
}

export interface Post {
  id:            string;
  user_id:       string;
  post_type:     string;
  content:       string;
  media_urls:    string[] | null;
  recipe_id:     string | null;
  like_count:    number;
  comment_count: number;
  view_count:    number;
  is_liked:      boolean;
  is_bookmarked: boolean;
  created_at:    string;
  updated_at:    string;
  profiles?: {
    username:    string | null;
    full_name:   string | null;
    avatar_url:  string | null;
    is_verified: boolean | null;
  } | null;
}

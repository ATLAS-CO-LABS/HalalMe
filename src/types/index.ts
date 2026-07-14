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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          id: string
          metadata: Json | null
          module: string | null
          summary: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          module?: string | null
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          module?: string | null
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          access: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          ingredients: string[] | null
          messages: Json
          recipe_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredients?: string[] | null
          messages?: Json
          recipe_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredients?: string[] | null
          messages?: Json
          recipe_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_limit_boosts: {
        Row: {
          boosted_limit: number
          expires_at: string
          user_id: string
        }
        Insert: {
          boosted_limit: number
          expires_at: string
          user_id: string
        }
        Update: {
          boosted_limit?: number
          expires_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_limit_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_request_counts: {
        Row: {
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_request_counts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          bonus_points: number
          category: string
          description: string
          icon: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          bonus_points?: number
          category: string
          description: string
          icon?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          bonus_points?: number
          category?: string
          description?: string
          icon?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      charities: {
        Row: {
          category: string
          charity_type: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string
          currency: string
          description: string
          document_paths: Json
          donor_count: number
          external_api_response: Json | null
          external_ref: string | null
          external_verified_at: string | null
          goal_amount: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_zakat_eligible: boolean
          last_verified_at: string | null
          legal_name: string | null
          long_description: string | null
          minimum_donation: number
          name: string
          platform_fee_pct: number
          raised_amount: number
          registration_number: string | null
          rejection_reason: string | null
          slug: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean
          stripe_country: string | null
          stripe_default_currency: string | null
          stripe_last_synced_at: string | null
          stripe_onboarding_sent_at: string | null
          stripe_onboarding_status: string
          stripe_onboarding_url: string | null
          stripe_onboarding_url_expires_at: string | null
          stripe_payouts_enabled: boolean
          submitted_by: string | null
          updated_at: string
          verification_expires_at: string | null
          verification_level: number
          verification_score: number
          verification_source: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          category: string
          charity_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          currency?: string
          description: string
          document_paths?: Json
          donor_count?: number
          external_api_response?: Json | null
          external_ref?: string | null
          external_verified_at?: string | null
          goal_amount: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_zakat_eligible?: boolean
          last_verified_at?: string | null
          legal_name?: string | null
          long_description?: string | null
          minimum_donation?: number
          name: string
          platform_fee_pct?: number
          raised_amount?: number
          registration_number?: string | null
          rejection_reason?: string | null
          slug: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean
          stripe_country?: string | null
          stripe_default_currency?: string | null
          stripe_last_synced_at?: string | null
          stripe_onboarding_sent_at?: string | null
          stripe_onboarding_status?: string
          stripe_onboarding_url?: string | null
          stripe_onboarding_url_expires_at?: string | null
          stripe_payouts_enabled?: boolean
          submitted_by?: string | null
          updated_at?: string
          verification_expires_at?: string | null
          verification_level?: number
          verification_score?: number
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string
          charity_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          currency?: string
          description?: string
          document_paths?: Json
          donor_count?: number
          external_api_response?: Json | null
          external_ref?: string | null
          external_verified_at?: string | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_zakat_eligible?: boolean
          last_verified_at?: string | null
          legal_name?: string | null
          long_description?: string | null
          minimum_donation?: number
          name?: string
          platform_fee_pct?: number
          raised_amount?: number
          registration_number?: string | null
          rejection_reason?: string | null
          slug?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean
          stripe_country?: string | null
          stripe_default_currency?: string | null
          stripe_last_synced_at?: string | null
          stripe_onboarding_sent_at?: string | null
          stripe_onboarding_status?: string
          stripe_onboarding_url?: string | null
          stripe_onboarding_url_expires_at?: string | null
          stripe_payouts_enabled?: boolean
          submitted_by?: string | null
          updated_at?: string
          verification_expires_at?: string | null
          verification_level?: number
          verification_score?: number
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charities_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      charity_applications: {
        Row: {
          applicant_user_id: string
          category: string
          charity_id: string | null
          charity_type: string
          contact_email: string
          contact_phone: string | null
          country: string
          created_at: string
          description: string
          display_name: string
          document_paths: Json
          documents_reviewed_at: string | null
          documents_reviewed_by: string | null
          external_check_ran_at: string | null
          external_check_response: Json | null
          external_check_status: string
          id: string
          is_zakat_eligible: boolean
          legal_name: string
          registration_number: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          applicant_user_id: string
          category: string
          charity_id?: string | null
          charity_type: string
          contact_email: string
          contact_phone?: string | null
          country: string
          created_at?: string
          description: string
          display_name: string
          document_paths?: Json
          documents_reviewed_at?: string | null
          documents_reviewed_by?: string | null
          external_check_ran_at?: string | null
          external_check_response?: Json | null
          external_check_status?: string
          id?: string
          is_zakat_eligible?: boolean
          legal_name: string
          registration_number: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          applicant_user_id?: string
          category?: string
          charity_id?: string | null
          charity_type?: string
          contact_email?: string
          contact_phone?: string | null
          country?: string
          created_at?: string
          description?: string
          display_name?: string
          document_paths?: Json
          documents_reviewed_at?: string | null
          documents_reviewed_by?: string | null
          external_check_ran_at?: string | null
          external_check_response?: Json | null
          external_check_status?: string
          id?: string
          is_zakat_eligible?: boolean
          legal_name?: string
          registration_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charity_applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_applications_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_applications_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_stripe_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_applications_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_trust_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_applications_documents_reviewed_by_fkey"
            columns: ["documents_reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      charity_verification_log: {
        Row: {
          application_id: string | null
          change_type: string
          changed_by: string | null
          charity_id: string
          created_at: string
          id: string
          new_level: number | null
          new_score: number | null
          new_status: string | null
          notes: string | null
          previous_level: number | null
          previous_score: number | null
          previous_status: string | null
          source: string | null
        }
        Insert: {
          application_id?: string | null
          change_type: string
          changed_by?: string | null
          charity_id: string
          created_at?: string
          id?: string
          new_level?: number | null
          new_score?: number | null
          new_status?: string | null
          notes?: string | null
          previous_level?: number | null
          previous_score?: number | null
          previous_status?: string | null
          source?: string | null
        }
        Update: {
          application_id?: string | null
          change_type?: string
          changed_by?: string | null
          charity_id?: string
          created_at?: string
          id?: string
          new_level?: number | null
          new_score?: number | null
          new_status?: string | null
          notes?: string | null
          previous_level?: number | null
          previous_score?: number | null
          previous_status?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charity_verification_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "charity_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_verification_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_verification_log_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_verification_log_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_stripe_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_verification_log_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_trust_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          like_count: number
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "following_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_flags: {
        Row: {
          created_at: string
          donation_id: string
          flag_type: string
          flagged_by: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          rewards_delayed: boolean
          rewards_released_at: string | null
          risk_score_at_flag: number | null
          signal_breakdown: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          donation_id: string
          flag_type: string
          flagged_by: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          rewards_delayed?: boolean
          rewards_released_at?: string | null
          risk_score_at_flag?: number | null
          signal_breakdown?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          donation_id?: string
          flag_type?: string
          flagged_by?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          rewards_delayed?: boolean
          rewards_released_at?: string | null
          risk_score_at_flag?: number | null
          signal_breakdown?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_flags_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_risk_log: {
        Row: {
          created_at: string
          donation_id: string
          id: string
          new_score: number
          notes: string | null
          previous_score: number | null
          scored_by: string
          signal_breakdown: Json
        }
        Insert: {
          created_at?: string
          donation_id: string
          id?: string
          new_score: number
          notes?: string | null
          previous_score?: number | null
          scored_by: string
          signal_breakdown?: Json
        }
        Update: {
          created_at?: string
          donation_id?: string
          id?: string
          new_score?: number
          notes?: string | null
          previous_score?: number | null
          scored_by?: string
          signal_breakdown?: Json
        }
        Relationships: [
          {
            foreignKeyName: "donation_risk_log_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          application_fee_amount: number | null
          charity_id: string
          created_at: string
          currency: string
          id: string
          idempotency_key: string
          ip_address: unknown
          is_anonymous: boolean
          message: string | null
          net_amount: number | null
          payment_intent_id: string | null
          payment_method_type: string | null
          payment_provider: string
          payment_ref: string | null
          platform_fee_amount: number | null
          points_earned: number
          receipt_sent_at: string | null
          receipt_url: string | null
          refund_ref: string | null
          refunded_at: string | null
          risk_score: number
          status: string
          stripe_charge_id: string | null
          stripe_fee_amount: number | null
          stripe_transfer_id: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          application_fee_amount?: number | null
          charity_id: string
          created_at?: string
          currency?: string
          id?: string
          idempotency_key: string
          ip_address?: unknown
          is_anonymous?: boolean
          message?: string | null
          net_amount?: number | null
          payment_intent_id?: string | null
          payment_method_type?: string | null
          payment_provider?: string
          payment_ref?: string | null
          platform_fee_amount?: number | null
          points_earned?: number
          receipt_sent_at?: string | null
          receipt_url?: string | null
          refund_ref?: string | null
          refunded_at?: string | null
          risk_score?: number
          status?: string
          stripe_charge_id?: string | null
          stripe_fee_amount?: number | null
          stripe_transfer_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          application_fee_amount?: number | null
          charity_id?: string
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string
          ip_address?: unknown
          is_anonymous?: boolean
          message?: string | null
          net_amount?: number | null
          payment_intent_id?: string | null
          payment_method_type?: string | null
          payment_provider?: string
          payment_ref?: string | null
          platform_fee_amount?: number | null
          points_earned?: number
          receipt_sent_at?: string | null
          receipt_url?: string | null
          refund_ref?: string | null
          refunded_at?: string | null
          risk_score?: number
          status?: string
          stripe_charge_id?: string | null
          stripe_fee_amount?: number | null
          stripe_transfer_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_stripe_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_trust_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_commission: {
        Row: {
          accepted_at: string | null
          contract_signed_at: string | null
          countered_commission: number | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          exclusivity: boolean | null
          existing_commission_band: string | null
          final_commission: number | null
          lane: string | null
          launch_ready_7d: boolean | null
          menu_ready: boolean | null
          merchant_id: string
          monthly_volume_band: string | null
          on_other_platform: boolean | null
          qualification_score: number | null
          recommended_commission: number | null
          referral_source: string | null
          requested_commission: number | null
          review_reason: string | null
          review_status: string
          score_breakdown: Json | null
          store_count: number | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          contract_signed_at?: string | null
          countered_commission?: number | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          exclusivity?: boolean | null
          existing_commission_band?: string | null
          final_commission?: number | null
          lane?: string | null
          launch_ready_7d?: boolean | null
          menu_ready?: boolean | null
          merchant_id: string
          monthly_volume_band?: string | null
          on_other_platform?: boolean | null
          qualification_score?: number | null
          recommended_commission?: number | null
          referral_source?: string | null
          requested_commission?: number | null
          review_reason?: string | null
          review_status?: string
          score_breakdown?: Json | null
          store_count?: number | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          contract_signed_at?: string | null
          countered_commission?: number | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          exclusivity?: boolean | null
          existing_commission_band?: string | null
          final_commission?: number | null
          lane?: string | null
          launch_ready_7d?: boolean | null
          menu_ready?: boolean | null
          merchant_id?: string
          monthly_volume_band?: string | null
          on_other_platform?: boolean | null
          qualification_score?: number | null
          recommended_commission?: number | null
          referral_source?: string | null
          requested_commission?: number | null
          review_reason?: string | null
          review_status?: string
          score_breakdown?: Json | null
          store_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_commission_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_documents: {
        Row: {
          cloudinary_public_id: string
          created_at: string
          doc_type: string
          expires_at: string | null
          file_name: string | null
          format: string | null
          id: string
          merchant_id: string
          rejection_reason: string | null
          resource_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          cloudinary_public_id: string
          created_at?: string
          doc_type: string
          expires_at?: string | null
          file_name?: string | null
          format?: string | null
          id?: string
          merchant_id: string
          rejection_reason?: string | null
          resource_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          cloudinary_public_id?: string
          created_at?: string
          doc_type?: string
          expires_at?: string | null
          file_name?: string | null
          format?: string | null
          id?: string
          merchant_id?: string
          rejection_reason?: string | null
          resource_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_documents_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          activated_at: string | null
          address: string | null
          assigned_rep: string | null
          assigned_rep_id: string | null
          business_email: string | null
          category_ids: string[] | null
          city: string | null
          commission_fixed: number | null
          commission_percentage: number | null
          contacted_at: string | null
          country: string
          country_code: string
          created_at: string
          email: string
          followup_count: number
          hyperzod_merchant_id: string | null
          hyperzod_sync_failed: boolean
          id: string
          invited_at: string | null
          last_followup_at: string | null
          name: string
          next_followup_on: string | null
          notes: string | null
          order_types: string[] | null
          owner_name: string | null
          phone: string
          post_code: string | null
          readiness_checklist: Json | null
          source_attribution: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
          welcome_sent_at: string | null
        }
        Insert: {
          activated_at?: string | null
          address?: string | null
          assigned_rep?: string | null
          assigned_rep_id?: string | null
          business_email?: string | null
          category_ids?: string[] | null
          city?: string | null
          commission_fixed?: number | null
          commission_percentage?: number | null
          contacted_at?: string | null
          country?: string
          country_code?: string
          created_at?: string
          email: string
          followup_count?: number
          hyperzod_merchant_id?: string | null
          hyperzod_sync_failed?: boolean
          id?: string
          invited_at?: string | null
          last_followup_at?: string | null
          name: string
          next_followup_on?: string | null
          notes?: string | null
          order_types?: string[] | null
          owner_name?: string | null
          phone: string
          post_code?: string | null
          readiness_checklist?: Json | null
          source_attribution?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          welcome_sent_at?: string | null
        }
        Update: {
          activated_at?: string | null
          address?: string | null
          assigned_rep?: string | null
          assigned_rep_id?: string | null
          business_email?: string | null
          category_ids?: string[] | null
          city?: string | null
          commission_fixed?: number | null
          commission_percentage?: number | null
          contacted_at?: string | null
          country?: string
          country_code?: string
          created_at?: string
          email?: string
          followup_count?: number
          hyperzod_merchant_id?: string | null
          hyperzod_sync_failed?: boolean
          id?: string
          invited_at?: string | null
          last_followup_at?: string | null
          name?: string
          next_followup_on?: string | null
          notes?: string | null
          order_types?: string[] | null
          owner_name?: string | null
          phone?: string
          post_code?: string | null
          readiness_checklist?: Json | null
          source_attribution?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          welcome_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_assigned_rep_id_fkey"
            columns: ["assigned_rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          comment_id: string | null
          created_at: string
          id: string
          is_read: boolean
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "following_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_bookmarks: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "following_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "following_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comment_count: number
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          featured_until: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          like_count: number
          media_public_ids: string[] | null
          media_urls: string[] | null
          post_type: string
          recipe_id: string | null
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          comment_count?: number
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          like_count?: number
          media_public_ids?: string[] | null
          media_urls?: string[] | null
          post_type?: string
          recipe_id?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          comment_count?: number
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          like_count?: number
          media_public_ids?: string[] | null
          media_urls?: string[] | null
          post_type?: string
          recipe_id?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_public_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          hyperzod_customer_id: string | null
          id: string
          is_verified: boolean
          lifetime_points: number
          location: string | null
          phone: string | null
          profile_flair: string | null
          reward_points: number
          reward_tier: string
          role: string
          status: string
          suspended_at: string | null
          suspended_by: string | null
          suspended_reason: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_public_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          hyperzod_customer_id?: string | null
          id: string
          is_verified?: boolean
          lifetime_points?: number
          location?: string | null
          phone?: string | null
          profile_flair?: string | null
          reward_points?: number
          reward_tier?: string
          role?: string
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_public_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hyperzod_customer_id?: string | null
          id?: string
          is_verified?: boolean
          lifetime_points?: number
          location?: string | null
          phone?: string | null
          profile_flair?: string | null
          reward_points?: number
          reward_tier?: string
          role?: string
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      recipe_favorites: {
        Row: {
          created_at: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          avg_rating: number | null
          cook_time_mins: number | null
          created_at: string
          cuisine: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          difficulty: string | null
          featured_until: string | null
          id: string
          image_public_id: string | null
          image_url: string | null
          ingredients: Json
          instructions: Json
          is_ai_generated: boolean
          is_featured: boolean
          is_halal_verified: boolean
          is_published: boolean
          nutrition: Json | null
          prep_time_mins: number | null
          review_count: number
          servings: number | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          avg_rating?: number | null
          cook_time_mins?: number | null
          created_at?: string
          cuisine?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          difficulty?: string | null
          featured_until?: string | null
          id?: string
          image_public_id?: string | null
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_ai_generated?: boolean
          is_featured?: boolean
          is_halal_verified?: boolean
          is_published?: boolean
          nutrition?: Json | null
          prep_time_mins?: number | null
          review_count?: number
          servings?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          avg_rating?: number | null
          cook_time_mins?: number | null
          created_at?: string
          cuisine?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          difficulty?: string | null
          featured_until?: string | null
          id?: string
          image_public_id?: string | null
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_ai_generated?: boolean
          is_featured?: boolean
          is_halal_verified?: boolean
          is_published?: boolean
          nutrition?: Json | null
          prep_time_mins?: number | null
          review_count?: number
          servings?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_catalog: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          max_per_user: number | null
          min_tier_required: string
          name: string
          points_required: number
          redeemed_count: number
          stock_remaining: number | null
          updated_at: string
          value_amount: number | null
          value_metadata: Json
          value_type: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          max_per_user?: number | null
          min_tier_required?: string
          name: string
          points_required: number
          redeemed_count?: number
          stock_remaining?: number | null
          updated_at?: string
          value_amount?: number | null
          value_metadata?: Json
          value_type: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          max_per_user?: number | null
          min_tier_required?: string
          name?: string
          points_required?: number
          redeemed_count?: number
          stock_remaining?: number | null
          updated_at?: string
          value_amount?: number | null
          value_metadata?: Json
          value_type?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          catalog_item_id: string
          created_at: string
          fulfilled_at: string | null
          id: string
          points_spent: number
          reversal_reason: string | null
          reversed_at: string | null
          status: string
          target_id: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          catalog_item_id: string
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          points_spent: number
          reversal_reason?: string | null
          reversed_at?: string | null
          status?: string
          target_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          catalog_item_id?: string
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          points_spent?: number
          reversal_reason?: string | null
          reversed_at?: string | null
          status?: string
          target_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "reward_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "reward_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_rules: {
        Row: {
          action: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          max_lifetime: number | null
          max_per_day: number | null
          points_per_unit: number
          unit: string
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          max_lifetime?: number | null
          max_per_day?: number | null
          points_per_unit: number
          unit?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          max_lifetime?: number | null
          max_per_day?: number | null
          points_per_unit?: number
          unit?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      reward_tiers: {
        Row: {
          ai_requests_per_hour: number
          color: string
          free_deliveries: number
          min_points: number
          min_redemption_points: number
          monthly_bonus_points: number
          multiplier_pct: number
          name: string
          sort_order: number
        }
        Insert: {
          ai_requests_per_hour?: number
          color: string
          free_deliveries?: number
          min_points: number
          min_redemption_points?: number
          monthly_bonus_points?: number
          multiplier_pct?: number
          name: string
          sort_order: number
        }
        Update: {
          ai_requests_per_hour?: number
          color?: string
          free_deliveries?: number
          min_points?: number
          min_redemption_points?: number
          monthly_bonus_points?: number
          multiplier_pct?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      reward_transactions: {
        Row: {
          action: string
          balance_after: number | null
          created_at: string
          created_date: string
          description: string | null
          expires_at: string | null
          id: string
          is_expired: boolean
          multiplier: number
          points: number
          redeemed_at: string | null
          redemption_ref: string | null
          reference_id: string | null
          source_donation_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          action: string
          balance_after?: number | null
          created_at?: string
          created_date?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_expired?: boolean
          multiplier?: number
          points: number
          redeemed_at?: string | null
          redemption_ref?: string | null
          reference_id?: string | null
          source_donation_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action?: string
          balance_after?: number | null
          created_at?: string
          created_date?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_expired?: boolean
          multiplier?: number
          points?: number
          redeemed_at?: string | null
          redemption_ref?: string | null
          reference_id?: string | null
          source_donation_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_transactions_source_donation_id_fkey"
            columns: ["source_donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          points_added: number
          rule_key: string
          threshold_value: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          points_added: number
          rule_key: string
          threshold_value?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          points_added?: number
          rule_key?: string
          threshold_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      stripe_connect_events: {
        Row: {
          charity_id: string | null
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          stripe_account_id: string | null
        }
        Insert: {
          charity_id?: string | null
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          stripe_account_id?: string | null
        }
        Update: {
          charity_id?: string | null
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          stripe_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_connect_events_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_connect_events_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_stripe_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_connect_events_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charity_trust_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          assigned_to: string | null
          created_at: string
          delivery_reference: string | null
          id: string
          last_message_at: string
          merchant_id: string | null
          priority: string
          requester_email: string | null
          requester_name: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          delivery_reference?: string | null
          id?: string
          last_message_at?: string
          merchant_id?: string | null
          priority?: string
          requester_email?: string | null
          requester_name?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          delivery_reference?: string | null
          id?: string
          last_message_at?: string
          merchant_id?: string | null
          priority?: string
          requester_email?: string | null
          requester_name?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_conversations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          is_internal: boolean
          sender_id: string | null
          sender_role: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
          sender_role: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          award_reason: string | null
          awarded_at: string
          badge_slug: string
          id: string
          user_id: string
        }
        Insert: {
          award_reason?: string | null
          awarded_at?: string
          badge_slug: string
          id?: string
          user_id: string
        }
        Update: {
          award_reason?: string | null
          awarded_at?: string
          badge_slug?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          provider?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          provider?: string
        }
        Relationships: []
      }
    }
    Views: {
      charity_stripe_status: {
        Row: {
          can_accept_donations: boolean | null
          connect_status: string | null
          id: string | null
          name: string | null
          slug: string | null
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_last_synced_at: string | null
          stripe_onboarding_sent_at: string | null
          stripe_onboarding_status: string | null
          stripe_payouts_enabled: boolean | null
          verification_status: string | null
        }
        Insert: {
          can_accept_donations?: never
          connect_status?: never
          id?: string | null
          name?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_last_synced_at?: string | null
          stripe_onboarding_sent_at?: string | null
          stripe_onboarding_status?: string | null
          stripe_payouts_enabled?: boolean | null
          verification_status?: string | null
        }
        Update: {
          can_accept_donations?: never
          connect_status?: never
          id?: string | null
          name?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_last_synced_at?: string | null
          stripe_onboarding_sent_at?: string | null
          stripe_onboarding_status?: string | null
          stripe_payouts_enabled?: boolean | null
          verification_status?: string | null
        }
        Relationships: []
      }
      charity_trust_badges: {
        Row: {
          id: string | null
          is_zakat_eligible: boolean | null
          last_verified_at: string | null
          name: string | null
          slug: string | null
          trust_tier: string | null
          verification_detail: string | null
          verification_label: string | null
          verification_level: number | null
          verification_score: number | null
          verification_source: string | null
        }
        Insert: {
          id?: string | null
          is_zakat_eligible?: boolean | null
          last_verified_at?: string | null
          name?: string | null
          slug?: string | null
          trust_tier?: never
          verification_detail?: never
          verification_label?: never
          verification_level?: number | null
          verification_score?: number | null
          verification_source?: string | null
        }
        Update: {
          id?: string | null
          is_zakat_eligible?: boolean | null
          last_verified_at?: string | null
          name?: string | null
          slug?: string | null
          trust_tier?: never
          verification_detail?: never
          verification_label?: never
          verification_level?: number | null
          verification_score?: number | null
          verification_source?: string | null
        }
        Relationships: []
      }
      following_posts_view: {
        Row: {
          comment_count: number | null
          content: string | null
          created_at: string | null
          follower_id: string | null
          id: string | null
          is_published: boolean | null
          like_count: number | null
          media_urls: string[] | null
          post_type: string | null
          profiles: Json | null
          recipe_id: string | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      award_badge: {
        Args: { p_badge_slug: string; p_reason?: string; p_user_id: string }
        Returns: undefined
      }
      award_points: {
        Args: {
          p_action: string
          p_amount?: number
          p_description?: string
          p_multiplier?: number
          p_reference_id?: string
          p_source_donation_id?: string
          p_user_id: string
        }
        Returns: number
      }
      check_and_award_badges:
        | { Args: { p_user_id: string }; Returns: undefined }
        | {
            Args: {
              p_extra_amount?: number
              p_extra_count?: number
              p_user_id: string
            }
            Returns: undefined
          }
      decrement_reward_points: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
      expire_feature_boosts: { Args: never; Returns: undefined }
      expire_stale_pending_donations: { Args: never; Returns: number }
      increment_post_view: { Args: { p_post_id: string }; Returns: undefined }
      recalculate_user_rewards: { Args: { p_user_id: string }; Returns: Json }
      redeem_reward: {
        Args: {
          p_catalog_item_id: string
          p_target_id?: string
          p_user_id: string
        }
        Returns: string
      }
      release_flagged_rewards: {
        Args: { p_donation_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
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

// Application types (Profile, Recipe, etc.) — kept in a separate file so they
// survive `supabase gen types` regeneration. Re-add this line after regenerating.
export * from "./app";

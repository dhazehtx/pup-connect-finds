export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_recovery: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          recovered: boolean | null
          recovery_token: string
          user_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recovered?: boolean | null
          recovery_token: string
          user_data: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recovered?: boolean | null
          recovery_token?: string
          user_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      ad_impressions: {
        Row: {
          ad_id: string | null
          clicked: boolean | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          page_url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          ad_id?: string | null
          clicked?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          ad_id?: string | null
          clicked?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          advertiser_name: string
          click_url: string | null
          created_at: string | null
          daily_budget: number | null
          description: string | null
          ends_at: string
          id: string
          image_url: string | null
          starts_at: string
          status: string | null
          target_page: string
          title: string
          total_clicks: number | null
          total_impressions: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          advertiser_name: string
          click_url?: string | null
          created_at?: string | null
          daily_budget?: number | null
          description?: string | null
          ends_at: string
          id?: string
          image_url?: string | null
          starts_at: string
          status?: string | null
          target_page: string
          title: string
          total_clicks?: number | null
          total_impressions?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          advertiser_name?: string
          click_url?: string | null
          created_at?: string | null
          daily_budget?: number | null
          description?: string | null
          ends_at?: string
          id?: string
          image_url?: string | null
          starts_at?: string
          status?: string | null
          target_page?: string
          title?: string
          total_clicks?: number | null
          total_impressions?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          event_data: Json
          event_type: string
          id: string
          page_url: string
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          event_data?: Json
          event_type: string
          id?: string
          page_url: string
          session_id: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          event_data?: Json
          event_type?: string
          id?: string
          page_url?: string
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      background_checks: {
        Row: {
          check_type: string
          created_at: string
          expires_at: string | null
          external_id: string | null
          id: string
          provider: string
          results: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          check_type: string
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          provider: string
          results?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          check_type?: string
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          provider?: string
          results?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "background_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      box_deliveries: {
        Row: {
          contents: Json | null
          created_at: string | null
          delivery_date: string
          id: string
          status: string | null
          subscription_id: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          contents?: Json | null
          created_at?: string | null
          delivery_date: string
          id?: string
          status?: string | null
          subscription_id?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          contents?: Json | null
          created_at?: string | null
          delivery_date?: string
          id?: string
          status?: string | null
          subscription_id?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "box_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscription_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      content_moderation: {
        Row: {
          ai_confidence: number | null
          ai_flags: Json | null
          content_id: string
          content_type: string
          created_at: string
          human_review: boolean | null
          id: string
          moderation_status: string
          review_notes: string | null
          reviewer_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_flags?: Json | null
          content_id: string
          content_type: string
          created_at?: string
          human_review?: boolean | null
          id?: string
          moderation_status?: string
          review_notes?: string | null
          reviewer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_flags?: Json | null
          content_id?: string
          content_type?: string
          created_at?: string
          human_review?: boolean | null
          id?: string
          moderation_status?: string
          review_notes?: string | null
          reviewer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_profiles_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_dog_listings_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_profiles_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dog_listings: {
        Row: {
          age: number
          breed: string
          color: string | null
          created_at: string | null
          delivery_available: boolean | null
          description: string | null
          dog_name: string
          gender: string | null
          good_with_dogs: boolean | null
          good_with_kids: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          listing_status: string | null
          location: string | null
          neutered_spayed: boolean | null
          price: number
          rehoming: boolean | null
          size: string | null
          special_needs: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vaccinated: boolean | null
          video_url: string | null
          videos: string[] | null
        }
        Insert: {
          age: number
          breed: string
          color?: string | null
          created_at?: string | null
          delivery_available?: boolean | null
          description?: string | null
          dog_name: string
          gender?: string | null
          good_with_dogs?: boolean | null
          good_with_kids?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          listing_status?: string | null
          location?: string | null
          neutered_spayed?: boolean | null
          price: number
          rehoming?: boolean | null
          size?: string | null
          special_needs?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vaccinated?: boolean | null
          video_url?: string | null
          videos?: string[] | null
        }
        Update: {
          age?: number
          breed?: string
          color?: string | null
          created_at?: string | null
          delivery_available?: boolean | null
          description?: string | null
          dog_name?: string
          gender?: string | null
          good_with_dogs?: boolean | null
          good_with_kids?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          listing_status?: string | null
          location?: string | null
          neutered_spayed?: boolean | null
          price?: number
          rehoming?: boolean | null
          size?: string | null
          special_needs?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vaccinated?: boolean | null
          video_url?: string | null
          videos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "dog_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_email: string
          id: string
          recipient_id: string
          status: string
          stripe_session_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          donor_email: string
          id?: string
          recipient_id: string
          status?: string
          stripe_session_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_email?: string
          id?: string
          recipient_id?: string
          status?: string
          stripe_session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          auto_refund_eligible: boolean | null
          buyer_confirmed_at: string | null
          buyer_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          dispute_created_at: string | null
          dispute_reason: string | null
          dispute_resolution: string | null
          dispute_resolution_notes: string | null
          dispute_resolved_at: string | null
          fraud_flags: Json | null
          funds_released_at: string | null
          id: string
          listing_id: string
          meeting_location: string | null
          meeting_scheduled_at: string | null
          refund_amount: number | null
          refund_processed_at: string | null
          refund_stripe_id: string | null
          seller_amount: number
          seller_confirmed_at: string | null
          seller_id: string
          status: string
          stripe_payment_intent_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          auto_refund_eligible?: boolean | null
          buyer_confirmed_at?: string | null
          buyer_id: string
          commission_amount: number
          commission_rate?: number
          created_at?: string
          dispute_created_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          dispute_resolution_notes?: string | null
          dispute_resolved_at?: string | null
          fraud_flags?: Json | null
          funds_released_at?: string | null
          id?: string
          listing_id: string
          meeting_location?: string | null
          meeting_scheduled_at?: string | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          refund_stripe_id?: string | null
          seller_amount: number
          seller_confirmed_at?: string | null
          seller_id: string
          status?: string
          stripe_payment_intent_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_refund_eligible?: boolean | null
          buyer_confirmed_at?: string | null
          buyer_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          dispute_created_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          dispute_resolution_notes?: string | null
          dispute_resolved_at?: string | null
          fraud_flags?: Json | null
          funds_released_at?: string | null
          id?: string
          listing_id?: string
          meeting_location?: string | null
          meeting_scheduled_at?: string | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          refund_stripe_id?: string | null
          seller_amount?: number
          seller_confirmed_at?: string | null
          seller_id?: string
          status?: string
          stripe_payment_intent_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_events: {
        Row: {
          auto_action_taken: string | null
          created_at: string
          details: Json
          detection_method: string
          escrow_transaction_id: string | null
          event_type: string
          id: string
          listing_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number
          status: string
          user_id: string | null
        }
        Insert: {
          auto_action_taken?: string | null
          created_at?: string
          details?: Json
          detection_method: string
          escrow_transaction_id?: string | null
          event_type: string
          id?: string
          listing_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number
          status?: string
          user_id?: string | null
        }
        Update: {
          auto_action_taken?: string | null
          created_at?: string
          details?: Json
          detection_method?: string
          escrow_transaction_id?: string | null
          event_type?: string
          id?: string
          listing_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_detection_events_escrow_transaction_id_fkey"
            columns: ["escrow_transaction_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_users: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      image_analysis: {
        Row: {
          analysis_type: string
          confidence: number | null
          created_at: string
          id: string
          image_url: string
          listing_id: string | null
          provider: string
          results: Json
        }
        Insert: {
          analysis_type: string
          confidence?: number | null
          created_at?: string
          id?: string
          image_url: string
          listing_id?: string | null
          provider: string
          results?: Json
        }
        Update: {
          analysis_type?: string
          confidence?: number | null
          created_at?: string
          id?: string
          image_url?: string
          listing_id?: string | null
          provider?: string
          results?: Json
        }
        Relationships: [
          {
            foreignKeyName: "image_analysis_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_preferences: {
        Row: {
          activity_level: string | null
          age_range_max: number | null
          age_range_min: number | null
          created_at: string
          experience_level: string | null
          id: string
          living_situation: Json | null
          location_radius: number | null
          preferred_breeds: string[] | null
          price_range_max: number | null
          price_range_min: number | null
          size_preferences: string[] | null
          temperament_preferences: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          experience_level?: string | null
          id?: string
          living_situation?: Json | null
          location_radius?: number | null
          preferred_breeds?: string[] | null
          price_range_max?: number | null
          price_range_min?: number | null
          size_preferences?: string[] | null
          temperament_preferences?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string | null
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          experience_level?: string | null
          id?: string
          living_situation?: Json | null
          location_radius?: number | null
          preferred_breeds?: string[] | null
          price_range_max?: number | null
          price_range_min?: number | null
          size_preferences?: string[] | null
          temperament_preferences?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matching_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: string
          parent_message_id: string
          reply_message_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_message_id: string
          reply_message_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_message_id?: string
          reply_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_reply_message_id_fkey"
            columns: ["reply_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          encrypted_content: string | null
          encryption_key_id: string | null
          id: string
          image_url: string | null
          is_encrypted: boolean | null
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          encrypted_content?: string | null
          encryption_key_id?: string | null
          id?: string
          image_url?: string | null
          is_encrypted?: boolean | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          encrypted_content?: string | null
          encryption_key_id?: string | null
          id?: string
          image_url?: string | null
          is_encrypted?: boolean | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_conversations_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_profiles_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          sender_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          sender_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          sender_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      pawbox_subscriptions: {
        Row: {
          created_at: string
          delivery_address: Json
          dog_profile: Json
          frequency: string
          id: string
          next_delivery_date: string | null
          price: number
          status: string
          stripe_subscription_id: string | null
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address: Json
          dog_profile?: Json
          frequency?: string
          id?: string
          next_delivery_date?: string | null
          price: number
          status?: string
          stripe_subscription_id?: string | null
          subscription_tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: Json
          dog_profile?: Json
          frequency?: string
          id?: string
          next_delivery_date?: string | null
          price?: number
          status?: string
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          amount: number
          buyer_email: string
          created_at: string
          currency: string
          id: string
          listing_id: string
          status: string
          stripe_payment_intent_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_email: string
          created_at?: string
          currency?: string
          id?: string
          listing_id: string
          status: string
          stripe_payment_intent_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_email?: string
          created_at?: string
          currency?: string
          id?: string
          listing_id?: string
          status?: string
          stripe_payment_intent_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          last_four: string | null
          stripe_payment_method_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          stripe_payment_method_id: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          created_at: string | null
          down_payment: number
          id: string
          listing_id: string
          monthly_payment: number
          next_payment_date: string | null
          number_of_payments: number
          payments_made: number | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          down_payment: number
          id?: string
          listing_id: string
          monthly_payment: number
          next_payment_date?: string | null
          number_of_payments: number
          payments_made?: number | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          down_payment?: number
          id?: string
          listing_id?: string
          monthly_payment?: number
          next_payment_date?: string | null
          number_of_payments?: number
          payments_made?: number | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string | null
          listing_id: string | null
          post_type: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          listing_id?: string | null
          post_type?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          listing_id?: string | null
          post_type?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_usage: {
        Row: {
          created_at: string | null
          feature_name: string
          id: string
          last_used_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          id?: string
          last_used_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          id?: string
          last_used_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      professional_account_requests: {
        Row: {
          admin_notes: string | null
          business_address: Json | null
          business_name: string
          business_references: Json | null
          business_type: string
          certifications: Json | null
          created_at: string
          id: string
          insurance_info: Json | null
          license_number: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          years_in_business: number | null
        }
        Insert: {
          admin_notes?: string | null
          business_address?: Json | null
          business_name: string
          business_references?: Json | null
          business_type: string
          certifications?: Json | null
          created_at?: string
          id?: string
          insurance_info?: Json | null
          license_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          years_in_business?: number | null
        }
        Update: {
          admin_notes?: string | null
          business_address?: Json | null
          business_name?: string
          business_references?: Json | null
          business_type?: string
          certifications?: Json | null
          created_at?: string
          id?: string
          insurance_info?: Json | null
          license_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          years_in_business?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_info: Json | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          privacy_settings: Json | null
          professional_status: string | null
          rating: number | null
          social_links: Json | null
          social_providers: Json | null
          total_reviews: number | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          username: string | null
          verified: boolean | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_info?: Json | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          privacy_settings?: Json | null
          professional_status?: string | null
          rating?: number | null
          social_links?: Json | null
          social_providers?: Json | null
          total_reviews?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
          verified?: boolean | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_info?: Json | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          privacy_settings?: Json | null
          professional_status?: string | null
          rating?: number | null
          social_links?: Json | null
          social_providers?: Json | null
          total_reviews?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
          verified?: boolean | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          amount: number
          created_at: string
          duration_days: number
          ends_at: string | null
          id: string
          listing_id: string
          starts_at: string | null
          status: string
          stripe_session_id: string
          tier_name: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          duration_days: number
          ends_at?: string | null
          id?: string
          listing_id: string
          starts_at?: string | null
          status?: string
          stripe_session_id: string
          tier_name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          duration_days?: number
          ends_at?: string | null
          id?: string
          listing_id?: string
          starts_at?: string | null
          status?: string
          stripe_session_id?: string
          tier_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_promotions_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          requests_count: number
          updated_at: string
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          requests_count?: number
          updated_at?: string
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          requests_count?: number
          updated_at?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          escrow_transaction_id: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          refund_amount: number
          refund_reason: string
          refund_type: string
          requester_id: string
          status: string
          stripe_refund_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          escrow_transaction_id?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          refund_amount: number
          refund_reason: string
          refund_type: string
          requester_id: string
          status?: string
          stripe_refund_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          escrow_transaction_id?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          refund_amount?: number
          refund_reason?: string
          refund_type?: string
          requester_id?: string
          status?: string
          stripe_refund_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_escrow_transaction_id_fkey"
            columns: ["escrow_transaction_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_analytics: {
        Row: {
          amount: number
          created_at: string
          currency: string
          date: string
          id: string
          listing_id: string | null
          metadata: Json | null
          revenue_type: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          date: string
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          revenue_type: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          revenue_type?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_analytics_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpfulness: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          review_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          review_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_photos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          listing_id: string | null
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          listing_id?: string | null
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          listing_id?: string | null
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "dog_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          notify_new_matches: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          name: string
          notify_new_matches?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          notify_new_matches?: boolean
          user_id?: string
        }
        Relationships: []
      }
      scheduled_events: {
        Row: {
          attendee_email: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          listing_id: string | null
          start_time: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          attendee_email?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          listing_id?: string | null
          start_time: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          attendee_email?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          listing_id?: string | null
          start_time?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          max_attempts: number | null
          scheduled_for: string
          status: string
          task_data: Json | null
          task_type: string
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          scheduled_for: string
          status?: string
          task_data?: Json | null
          task_type: string
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          scheduled_for?: string
          status?: string
          task_data?: Json | null
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json
          event_type: string
          id: string
          ip_address: unknown | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          booking_date: string
          booking_time: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          customer_id: string
          customer_notes: string | null
          duration_hours: number | null
          id: string
          provider_id: string
          provider_notes: string | null
          service_id: string
          status: string
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          customer_id: string
          customer_notes?: string | null
          duration_hours?: number | null
          id?: string
          provider_id: string
          provider_notes?: string | null
          service_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          customer_id?: string
          customer_notes?: string | null
          duration_hours?: number | null
          id?: string
          provider_id?: string
          provider_notes?: string | null
          service_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          availability: Json | null
          business_name: string
          commission_rate: number | null
          created_at: string | null
          description: string | null
          id: string
          location: string
          pricing: Json | null
          rating: number | null
          service_types: Database["public"]["Enums"]["service_type"][]
          stripe_connect_account_id: string | null
          total_bookings: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          availability?: Json | null
          business_name: string
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          location: string
          pricing?: Json | null
          rating?: number | null
          service_types: Database["public"]["Enums"]["service_type"][]
          stripe_connect_account_id?: string | null
          total_bookings?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          availability?: Json | null
          business_name?: string
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string
          pricing?: Json | null
          rating?: number | null
          service_types?: Database["public"]["Enums"]["service_type"][]
          stripe_connect_account_id?: string | null
          total_bookings?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      service_reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          provider_id: string
          rating: number
          reviewer_id: string
          service_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          provider_id: string
          rating: number
          reviewer_id: string
          service_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          provider_id?: string
          rating?: number
          reviewer_id?: string
          service_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          availability: Json | null
          certifications: Json | null
          created_at: string
          description: string | null
          experience_years: number | null
          featured_until: string | null
          id: string
          images: Json | null
          location: string | null
          price: number
          price_type: string
          service_areas: Json | null
          service_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          certifications?: Json | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          featured_until?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          price: number
          price_type: string
          service_areas?: Json | null
          service_type: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          certifications?: Json | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          featured_until?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          price?: number
          price_type?: string
          service_areas?: Json | null
          service_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_notifications: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          phone_number: string
          provider: string
          provider_message_id: string | null
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          phone_number: string
          provider?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          phone_number?: string
          provider?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          created_at: string
          follower_count: number | null
          id: string
          platform: string
          platform_user_id: string
          profile_url: string | null
          updated_at: string
          user_id: string
          username: string | null
          verification_date: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          follower_count?: number | null
          id?: string
          platform: string
          platform_user_id: string
          profile_url?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          verification_date?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          follower_count?: number | null
          id?: string
          platform?: string
          platform_user_id?: string
          profile_url?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          verification_date?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhooks: {
        Row: {
          created_at: string
          data: Json
          event_type: string
          id: string
          processed: boolean
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          event_type: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          event_type?: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          features_enabled: Json | null
          id: string
          pending_tier_change: string | null
          previous_tier: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          tier_change_at: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          features_enabled?: Json | null
          id?: string
          pending_tier_change?: string | null
          previous_tier?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          tier_change_at?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          features_enabled?: Json | null
          id?: string
          pending_tier_change?: string | null
          previous_tier?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          tier_change_at?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_analytics: {
        Row: {
          cancelled_subscriptions: number
          created_at: string
          date: string
          downgrades: number
          id: string
          mrr: number
          new_subscriptions: number
          tier_breakdown: Json
          total_revenue: number
          upgrades: number
        }
        Insert: {
          cancelled_subscriptions?: number
          created_at?: string
          date: string
          downgrades?: number
          id?: string
          mrr?: number
          new_subscriptions?: number
          tier_breakdown?: Json
          total_revenue?: number
          upgrades?: number
        }
        Update: {
          cancelled_subscriptions?: number
          created_at?: string
          date?: string
          downgrades?: number
          id?: string
          mrr?: number
          new_subscriptions?: number
          tier_breakdown?: Json
          total_revenue?: number
          upgrades?: number
        }
        Relationships: []
      }
      subscription_boxes: {
        Row: {
          box_size: string
          created_at: string | null
          delivery_frequency: string | null
          dietary_preferences: Json | null
          dog_age_range: string
          id: string
          monthly_price: number
          next_delivery_date: string | null
          shipping_address: Json
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          box_size: string
          created_at?: string | null
          delivery_frequency?: string | null
          dietary_preferences?: Json | null
          dog_age_range: string
          id?: string
          monthly_price: number
          next_delivery_date?: string | null
          shipping_address: Json
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          box_size?: string
          created_at?: string | null
          delivery_frequency?: string | null
          dietary_preferences?: Json | null
          dog_age_range?: string
          id?: string
          monthly_price?: number
          next_delivery_date?: string | null
          shipping_address?: Json
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_encryption_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          key_fingerprint: string
          public_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_fingerprint: string
          public_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_fingerprint?: string
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          ip_address: unknown | null
          metadata: Json | null
          session_id: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          matching_criteria: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          matching_criteria?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          matching_criteria?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          last_seen_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          last_seen_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          last_seen_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          is_premium_user: boolean | null
          pup_box_subscribed: boolean | null
          stripe_customer_id: string | null
          subscription_status: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_premium_user?: boolean | null
          pup_box_subscribed?: boolean | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_premium_user?: boolean | null
          pup_box_subscribed?: boolean | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          status: string | null
          uploaded_at: string | null
          user_id: string
          verification_request_id: string | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          uploaded_at?: string | null
          user_id: string
          verification_request_id?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          uploaded_at?: string | null
          user_id?: string
          verification_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_verification_request_id_fkey"
            columns: ["verification_request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          address_proof: string | null
          business_license: string | null
          contact_verification: Json | null
          created_at: string
          experience_details: string | null
          id: string
          id_document: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          address_proof?: string | null
          business_license?: string | null
          contact_verification?: Json | null
          created_at?: string
          experience_details?: string | null
          id?: string
          id_document?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
          verification_type: string
        }
        Update: {
          address_proof?: string | null
          business_license?: string | null
          contact_verification?: Json | null
          created_at?: string
          experience_details?: string | null
          id?: string
          id_document?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: { user_id_param: string }
        Returns: Json
      }
      export_user_data: {
        Args: { user_id_param: string }
        Returns: Json
      }
      flag_potential_fraud: {
        Args: {
          transaction_id: string
          event_type: string
          risk_score: number
          details?: Json
        }
        Returns: string
      }
      initiate_account_deletion: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_automatic_refund: {
        Args: {
          escrow_transaction_id_param: string
          refund_reason: string
          refund_type?: string
        }
        Returns: Json
      }
      recover_account: {
        Args: { recovery_token_param: string }
        Returns: Json
      }
      upsert_analytics: {
        Args: {
          analytics_date: string
          metric_name: string
          metric_value: number
        }
        Returns: undefined
      }
    }
    Enums: {
      service_type:
        | "grooming"
        | "walking"
        | "training"
        | "veterinary"
        | "boarding"
        | "sitting"
      subscription_tier: "free" | "premium" | "provider" | "admin"
      user_type: "buyer" | "breeder" | "shelter" | "admin"
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
      service_type: [
        "grooming",
        "walking",
        "training",
        "veterinary",
        "boarding",
        "sitting",
      ],
      subscription_tier: ["free", "premium", "provider", "admin"],
      user_type: ["buyer", "breeder", "shelter", "admin"],
    },
  },
} as const

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://skkhbzrvzbsqebujlwcu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2hienJ2emJzcWVidWpsd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjMyNjksImV4cCI6MjA3NjA5OTI2OX0.e5cZBssEwLEvekK2U3-9l0qGtgcYIz5ABLndgjtF-_E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string | null
          relationship: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          relationship?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          relationship?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      legacy_messages: {
        Row: {
          id: string
          user_id: string
          title: string
          content_type: 'text' | 'image' | 'video' | 'financial' | 'document'
          message_text: string | null
          image_url: string | null
          video_url: string | null
          financial_info: any | null
          document_url: string | null
          scheduled_date: string
          reminder_days: number
          last_reminder_sent: string | null
          status: 'scheduled' | 'cancelled' | 'sent' | 'failed'
          sent_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          is_private: boolean
          requires_confirmation: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content_type: 'text' | 'image' | 'video' | 'financial' | 'document'
          message_text?: string | null
          image_url?: string | null
          video_url?: string | null
          financial_info?: any | null
          document_url?: string | null
          scheduled_date: string
          reminder_days?: number
          last_reminder_sent?: string | null
          status?: 'scheduled' | 'cancelled' | 'sent' | 'failed'
          sent_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          is_private?: boolean
          requires_confirmation?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content_type?: 'text' | 'image' | 'video' | 'financial' | 'document'
          message_text?: string | null
          image_url?: string | null
          video_url?: string | null
          financial_info?: any | null
          document_url?: string | null
          scheduled_date?: string
          reminder_days?: number
          last_reminder_sent?: string | null
          status?: 'scheduled' | 'cancelled' | 'sent' | 'failed'
          sent_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          is_private?: boolean
          requires_confirmation?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      message_recipients: {
        Row: {
          id: string
          message_id: string
          recipient_id: string
          custom_message: string | null
          delivery_status: 'pending' | 'sent' | 'failed' | 'bounced'
          delivered_at: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          recipient_id: string
          custom_message?: string | null
          delivery_status?: 'pending' | 'sent' | 'failed' | 'bounced'
          delivered_at?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          recipient_id?: string
          custom_message?: string | null
          delivery_status?: 'pending' | 'sent' | 'failed' | 'bounced'
          delivered_at?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      notification_logs: {
        Row: {
          id: string
          user_id: string
          message_id: string
          notification_type: 'reminder' | 'confirmation' | 'delivery' | 'cancellation'
          sent_to: string
          sent_via: 'email' | 'sms'
          status: 'sent' | 'failed' | 'bounced'
          content: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          notification_type: 'reminder' | 'confirmation' | 'delivery' | 'cancellation'
          sent_to: string
          sent_via: 'email' | 'sms'
          status?: 'sent' | 'failed' | 'bounced'
          content?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          notification_type?: 'reminder' | 'confirmation' | 'delivery' | 'cancellation'
          sent_to?: string
          sent_via?: 'email' | 'sms'
          status?: 'sent' | 'failed' | 'bounced'
          content?: string | null
          sent_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          reminder_frequency: number
          email_notifications: boolean
          sms_notifications: boolean
          timezone: string
          language: string
          two_factor_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          reminder_frequency?: number
          email_notifications?: boolean
          sms_notifications?: boolean
          timezone?: string
          language?: string
          two_factor_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          reminder_frequency?: number
          email_notifications?: boolean
          sms_notifications?: boolean
          timezone?: string
          language?: string
          two_factor_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_messages_needing_reminders: {
        Args: {}
        Returns: {
          message_id: string
          user_id: string
          title: string
          scheduled_date: string
          reminder_days: number
          user_email: string
          user_name: string
        }[]
      }
      get_messages_ready_to_send: {
        Args: {}
        Returns: {
          message_id: string
          user_id: string
          title: string
          content_type: string
          message_text: string
          image_url: string
          video_url: string
          financial_info: any
          document_url: string
          recipients: any
        }[]
      }
      mark_message_as_sent: {
        Args: { message_uuid: string }
        Returns: void
      }
      update_reminder_sent: {
        Args: { message_uuid: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
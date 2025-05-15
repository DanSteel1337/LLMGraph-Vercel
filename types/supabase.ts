export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          content: string | null
          category: string
          user_id: string | null
          created_at: string
          updated_at: string | null
          metadata: Json | null
          status: string | null
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          category: string
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
          metadata?: Json | null
          status?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          category?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
          metadata?: Json | null
          status?: string | null
        }
      }
      feedback: {
        Row: {
          id: string
          document_id: string | null
          content: string
          correction: string | null
          status: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id?: string | null
          content: string
          correction?: string | null
          status?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string | null
          content?: string
          correction?: string | null
          status?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          query: string
          results_count: number
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          query: string
          results_count: number
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          query?: string
          results_count?: number
          user_id?: string | null
          created_at?: string
        }
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

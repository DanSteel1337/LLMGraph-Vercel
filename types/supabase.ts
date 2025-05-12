export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          user_id: string
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id: string
          title: string
          content: string
          category: string
          user_id: string
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      feedback: {
        Row: {
          id: string
          document_id: string
          content: string
          correction: string
          status: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          document_id: string
          content: string
          correction: string
          status?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          correction?: string
          status?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          query: string
          count: number
          results_count: number
          user_id: string | null
          created_at: string
          last_searched_at: string
        }
        Insert: {
          id?: string
          query: string
          count?: number
          results_count?: number
          user_id?: string | null
          created_at?: string
          last_searched_at?: string
        }
        Update: {
          id?: string
          query?: string
          count?: number
          results_count?: number
          user_id?: string | null
          created_at?: string
          last_searched_at?: string
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
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

// Database schema types
export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface ChatMessage {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  metadata: {
    language?: string
    topic?: string
    level?: string
    translation?: string
  }
  embedding?: number[]
  created_at: string
}

export interface MessageWithEmbedding extends ChatMessage {
  similarity?: number
} 
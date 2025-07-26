import { supabase, ChatSession, ChatMessage, MessageWithEmbedding } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// Initialize OpenAI client only if API key is available
let openai: any = null
try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai')
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
} catch (error) {
  console.warn('OpenAI not available:', error)
}

// Fallback to in-memory storage if Supabase is not configured
const USE_SUPABASE = !!(supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

class VectorRAGStore {
  private inMemoryMessages: ChatMessage[] = []
  private inMemorySessions: ChatSession[] = []

  // Generate embeddings for text using OpenAI
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!openai) {
        console.warn('OpenAI not configured, skipping embedding generation')
        return []
      }

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 1536
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      return []
    }
  }

  // Store a new message
  async storeMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    const messageId = uuidv4()
    const now = new Date().toISOString()
    
    // Generate embedding for the message content
    const embedding = await this.generateEmbedding(message.content)

    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      created_at: now,
      embedding
    }

    if (USE_SUPABASE && supabase) {
      try {
        // Store in Supabase
        const { data, error } = await supabase
          .from('chat_messages')
          .insert([{
            id: newMessage.id,
            session_id: newMessage.session_id,
            user_id: newMessage.user_id,
            role: newMessage.role,
            content: newMessage.content,
            metadata: newMessage.metadata,
            embedding: newMessage.embedding,
            created_at: newMessage.created_at
          }])
          .select()
          .single()

        if (error) {
          console.error('Error storing message in Supabase:', error)
          // Fall back to in-memory storage
          this.inMemoryMessages.push(newMessage)
        }

        // Update session message count
        await this.updateSessionMessageCount(message.session_id, message.user_id)
        
        return newMessage
      } catch (error) {
        console.error('Supabase error:', error)
        // Fall back to in-memory storage
        this.inMemoryMessages.push(newMessage)
      }
    } else {
      // Use in-memory storage
      this.inMemoryMessages.push(newMessage)
    }

    // Update session in in-memory storage
    await this.updateSessionMessageCountInMemory(message.session_id, message.user_id)
    
    return newMessage
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    if (USE_SUPABASE && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching session messages:', error)
          // Fall back to in-memory storage
          return this.inMemoryMessages
            .filter(msg => msg.session_id === sessionId && msg.user_id === userId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        }

        return data || []
      } catch (error) {
        console.error('Supabase error:', error)
        // Fall back to in-memory storage
        return this.inMemoryMessages
          .filter(msg => msg.session_id === sessionId && msg.user_id === userId)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }
    }

    // Use in-memory storage
    return this.inMemoryMessages
      .filter(msg => msg.session_id === sessionId && msg.user_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  // Get user's chat sessions
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    if (USE_SUPABASE && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Error fetching user sessions:', error)
          // Fall back to in-memory storage
          return this.inMemorySessions
            .filter(session => session.user_id === userId)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        }

        return data || []
      } catch (error) {
        console.error('Supabase error:', error)
        // Fall back to in-memory storage
        return this.inMemorySessions
          .filter(session => session.user_id === userId)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      }
    }

    // Use in-memory storage
    return this.inMemorySessions
      .filter(session => session.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }

  // Create a new session
  async createSession(userId: string, title?: string): Promise<ChatSession> {
    const sessionId = uuidv4()
    const now = new Date().toISOString()
    
    const session: ChatSession = {
      id: sessionId,
      user_id: userId,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      created_at: now,
      updated_at: now,
      message_count: 0
    }

    if (USE_SUPABASE && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([session])
          .select()
          .single()

        if (error) {
          console.error('Error creating session in Supabase:', error)
          // Fall back to in-memory storage
          this.inMemorySessions.push(session)
        }

        return session
      } catch (error) {
        console.error('Supabase error:', error)
        // Fall back to in-memory storage
        this.inMemorySessions.push(session)
      }
    } else {
      // Use in-memory storage
      this.inMemorySessions.push(session)
    }

    return session
  }

  // Get relevant context using vector similarity search
  async getRelevantContext(
    userId: string, 
    currentMessage: string, 
    limit: number = 10
  ): Promise<MessageWithEmbedding[]> {
    // Generate embedding for the current message
    const queryEmbedding = await this.generateEmbedding(currentMessage)
    
    if (queryEmbedding.length === 0) {
      // Fall back to keyword-based search if embeddings are not available
      return this.getKeywordBasedContext(userId, currentMessage, limit)
    }

    if (USE_SUPABASE && supabase) {
      try {
        // Use Supabase's vector similarity search with pgvector
        const { data, error } = await supabase.rpc('match_messages', {
          query_embedding: queryEmbedding,
          query_user_id: userId,
          match_threshold: 0.3,
          match_count: limit
        })

        if (error) {
          console.error('Error in vector search:', error)
          // Fall back to keyword-based search
          return this.getKeywordBasedContext(userId, currentMessage, limit)
        }

        return data || []
      } catch (error) {
        console.error('Vector search error:', error)
        // Fall back to keyword-based search
        return this.getKeywordBasedContext(userId, currentMessage, limit)
      }
    }

    // For in-memory storage, use cosine similarity
    return this.getInMemoryVectorContext(userId, queryEmbedding, limit)
  }

  // Keyword-based fallback search
  private async getKeywordBasedContext(
    userId: string, 
    currentMessage: string, 
    limit: number
  ): Promise<MessageWithEmbedding[]> {
    let userMessages: ChatMessage[]

    if (USE_SUPABASE && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit * 2)

        userMessages = data || []
      } catch (error) {
        userMessages = this.inMemoryMessages.filter(msg => msg.user_id === userId)
      }
    } else {
      userMessages = this.inMemoryMessages.filter(msg => msg.user_id === userId)
    }

    // Simple keyword matching
    const currentWords = currentMessage.toLowerCase().split(/\s+/)
    
    const scoredMessages = userMessages.map(msg => {
      const messageWords = msg.content.toLowerCase().split(/\s+/)
      const keywordScore = currentWords.reduce((score, word) => {
        return score + (messageWords.includes(word) ? 1 : 0)
      }, 0) / currentWords.length

      // Recency score
      const now = Date.now()
      const messageAge = now - new Date(msg.created_at).getTime()
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
      const recencyScore = Math.max(0, 1 - (messageAge / maxAge))

      return {
        ...msg,
        similarity: keywordScore * 0.7 + recencyScore * 0.3
      }
    })

    return scoredMessages
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  // In-memory vector search using cosine similarity
  private getInMemoryVectorContext(
    userId: string, 
    queryEmbedding: number[], 
    limit: number
  ): MessageWithEmbedding[] {
    const userMessages = this.inMemoryMessages.filter(msg => 
      msg.user_id === userId && msg.embedding && msg.embedding.length > 0
    )

    const scoredMessages = userMessages.map(msg => {
      const similarity = this.cosineSimilarity(queryEmbedding, msg.embedding!)
      return { ...msg, similarity }
    })

    return scoredMessages
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))

    return dotProduct / (magnitudeA * magnitudeB)
  }

  // Update session message count
  private async updateSessionMessageCount(sessionId: string, userId: string): Promise<void> {
    if (USE_SUPABASE && supabase) {
      try {
        // Get current message count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionId)
          .eq('user_id', userId)

        // Update session
        await supabase
          .from('chat_sessions')
          .update({ 
            message_count: count || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .eq('user_id', userId)
      } catch (error) {
        console.error('Error updating session message count:', error)
      }
    }
  }

  // Update session message count in memory
  private async updateSessionMessageCountInMemory(sessionId: string, userId: string): Promise<void> {
    const session = this.inMemorySessions.find(s => s.id === sessionId && s.user_id === userId)
    if (session) {
      session.message_count = this.inMemoryMessages.filter(
        msg => msg.session_id === sessionId && msg.user_id === userId
      ).length
      session.updated_at = new Date().toISOString()
    }
  }

  // Delete a session
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    if (USE_SUPABASE && supabase) {
      try {
        // Delete messages first
        await supabase
          .from('chat_messages')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', userId)

        // Delete session
        await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', userId)
      } catch (error) {
        console.error('Error deleting session from Supabase:', error)
        // Fall back to in-memory deletion
        this.inMemorySessions = this.inMemorySessions.filter(
          session => !(session.id === sessionId && session.user_id === userId)
        )
        this.inMemoryMessages = this.inMemoryMessages.filter(
          msg => !(msg.session_id === sessionId && msg.user_id === userId)
        )
      }
    } else {
      // Use in-memory storage
      this.inMemorySessions = this.inMemorySessions.filter(
        session => !(session.id === sessionId && session.user_id === userId)
      )
      this.inMemoryMessages = this.inMemoryMessages.filter(
        msg => !(msg.session_id === sessionId && msg.user_id === userId)
      )
    }
  }

  // Get session by ID
  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    if (USE_SUPABASE && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single()

        if (error) {
          console.error('Error fetching session:', error)
          // Fall back to in-memory storage
          return this.inMemorySessions.find(
            session => session.id === sessionId && session.user_id === userId
          ) || null
        }

        return data
      } catch (error) {
        console.error('Supabase error:', error)
        // Fall back to in-memory storage
        return this.inMemorySessions.find(
          session => session.id === sessionId && session.user_id === userId
        ) || null
      }
    }

    // Use in-memory storage
    return this.inMemorySessions.find(
      session => session.id === sessionId && session.user_id === userId
    ) || null
  }
}

// Export singleton instance
export const vectorRAGStore = new VectorRAGStore()

// Helper function to generate context summary for AI
export function generateContextSummary(messages: MessageWithEmbedding[]): string {
  if (messages.length === 0) return ''
  
  const summary = messages
    .slice(-20) // Last 20 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')
  
  return `Previous conversation context (similarity-based retrieval):\n${summary}\n\n`
} 
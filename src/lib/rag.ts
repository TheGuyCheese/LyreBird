import { v4 as uuidv4 } from 'uuid'

export interface ChatMessage {
  id: string
  userId: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    language?: string
    topic?: string
    level?: string
    translation?: string
  }
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}

// In-memory storage for chat history
// In production, this should be replaced with a proper database like PostgreSQL with pgvector
class InMemoryRAGStore {
  private messages: ChatMessage[] = []
  private sessions: ChatSession[] = []

  // Store a new message
  async storeMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    }
    
    this.messages.push(newMessage)
    
    // Update or create session
    await this.updateSession(message.sessionId, message.userId)
    
    return newMessage
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    return this.messages
      .filter(msg => msg.sessionId === sessionId && msg.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // Get user's chat sessions
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return this.sessions
      .filter(session => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  // Create a new session
  async createSession(userId: string, title?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: uuidv4(),
      userId,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0
    }
    
    this.sessions.push(session)
    return session
  }

  // Update session metadata
  private async updateSession(sessionId: string, userId: string): Promise<void> {
    let session = this.sessions.find(s => s.id === sessionId && s.userId === userId)
    
    if (!session) {
      // Create session if it doesn't exist
      session = await this.createSession(userId)
      // Update the sessionId for all messages
      this.messages.forEach(msg => {
        if (msg.sessionId === sessionId && msg.userId === userId) {
          msg.sessionId = session!.id
        }
      })
    } else {
      session.updatedAt = new Date()
      session.messageCount = this.messages.filter(
        msg => msg.sessionId === sessionId && msg.userId === userId
      ).length
    }
  }

  // Get relevant context from chat history
  async getRelevantContext(
    userId: string, 
    currentMessage: string, 
    limit: number = 10
  ): Promise<ChatMessage[]> {
    // Get user's recent messages
    const userMessages = this.messages
      .filter(msg => msg.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit * 2) // Get more messages for better context

    // Simple relevance scoring based on:
    // 1. Recency (more recent = higher score)
    // 2. Keyword overlap (simple word matching)
    const currentWords = currentMessage.toLowerCase().split(/\s+/)
    
    const scoredMessages = userMessages.map(msg => {
      const messageWords = msg.content.toLowerCase().split(/\s+/)
      const keywordScore = currentWords.reduce((score, word) => {
        return score + (messageWords.includes(word) ? 1 : 0)
      }, 0) / currentWords.length

      // Recency score (newer messages get higher scores)
      const now = Date.now()
      const messageAge = now - msg.timestamp.getTime()
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      const recencyScore = Math.max(0, 1 - (messageAge / maxAge))

      return {
        message: msg,
        score: keywordScore * 0.7 + recencyScore * 0.3
      }
    })

    return scoredMessages
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.message)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // Delete a session
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    this.sessions = this.sessions.filter(
      session => !(session.id === sessionId && session.userId === userId)
    )
    this.messages = this.messages.filter(
      msg => !(msg.sessionId === sessionId && msg.userId === userId)
    )
  }

  // Get session by ID
  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    return this.sessions.find(
      session => session.id === sessionId && session.userId === userId
    ) || null
  }
}

// Export singleton instance
export const ragStore = new InMemoryRAGStore()

// Helper function to generate context summary for AI
export function generateContextSummary(messages: ChatMessage[]): string {
  if (messages.length === 0) return ''
  
  const summary = messages
    .slice(-20) // Last 20 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')
  
  return `Previous conversation context:\n${summary}\n\n`
} 
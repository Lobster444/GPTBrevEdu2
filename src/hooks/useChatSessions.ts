import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { ChatSession, ChatSessionInput } from '../types/tavus'
import { chatSessionHelpers } from '../lib/chatSessions'

interface UseChatSessionsReturn {
  sessions: ChatSession[]
  loading: boolean
  error: string | null
  createSession: (input: ChatSessionInput) => Promise<ChatSession>
  endSession: (sessionId: string) => Promise<void>
  refreshSessions: () => Promise<void>
}

export const useChatSessions = (): UseChatSessionsReturn => {
  const { user, isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshSessions = async () => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      setError(null)
      const userSessions = await chatSessionHelpers.getUserChatSessions(user.id)
      setSessions(userSessions)
    } catch (err: any) {
      console.error('Error refreshing sessions:', err)
      setError(err.message || 'Failed to load chat sessions')
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (input: ChatSessionInput): Promise<ChatSession> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to create chat sessions')
    }

    try {
      setError(null)
      const session = await chatSessionHelpers.createChatSession(user.id, input)
      setSessions(prev => [session, ...prev])
      return session
    } catch (err: any) {
      console.error('Error creating session:', err)
      setError(err.message || 'Failed to create chat session')
      throw err
    }
  }

  const endSession = async (sessionId: string): Promise<void> => {
    try {
      setError(null)
      await chatSessionHelpers.endChatSession(sessionId)
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'completed', ended_at: new Date().toISOString() }
            : session
        )
      )
    } catch (err: any) {
      console.error('Error ending session:', err)
      setError(err.message || 'Failed to end chat session')
      throw err
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshSessions()
    } else {
      setSessions([])
    }
  }, [isAuthenticated, user])

  return {
    sessions,
    loading,
    error,
    createSession,
    endSession,
    refreshSessions
  }
}
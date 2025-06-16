import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export type UserRole = 'anonymous' | 'free' | 'premium'

interface ChatSessionData {
  chatSessionsToday: number
  chatLimit: number
  canStartChat: boolean
  timeUntilReset: string
}

interface UserAccess {
  role: UserRole
  isAuthenticated: boolean
  canAccessCourses: boolean
  canAccessPremiumContent: boolean
  chatData: ChatSessionData
  loading: boolean
}

export const useUserAccess = (): UserAccess => {
  const { user, profile, isAuthenticated, loading: authLoading, isSupabaseReachable } = useAuth()
  const [chatData, setChatData] = useState<ChatSessionData>({
    chatSessionsToday: 0,
    chatLimit: 0,
    canStartChat: false,
    timeUntilReset: '00:00:00'
  })
  const [loading, setLoading] = useState(true)

  // Determine user role
  const role: UserRole = !isAuthenticated ? 'anonymous' : (profile?.role === 'premium' ? 'premium' : 'free')

  // Calculate chat limits based on role
  const getChatLimit = (userRole: UserRole): number => {
    switch (userRole) {
      case 'premium': return 3
      case 'free': return 1
      case 'anonymous': return 0
    }
  }

  // Calculate time until midnight reset
  const getTimeUntilReset = (): string => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Fetch user's chat sessions for today
  const fetchChatData = async () => {
    if (!isAuthenticated || !user || !isSupabaseReachable) {
      const limit = getChatLimit(role)
      setChatData({
        chatSessionsToday: 0,
        chatLimit: limit,
        canStartChat: limit > 0,
        timeUntilReset: getTimeUntilReset()
      })
      return
    }

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: sessions, error } = await supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('user_id', user.id)
        .gte('started_at', today.toISOString())
        .lt('started_at', tomorrow.toISOString())

      if (error) {
        console.error('Error fetching chat sessions:', error)
        return
      }

      const chatSessionsToday = sessions?.length || 0
      const chatLimit = getChatLimit(role)
      const canStartChat = chatSessionsToday < chatLimit

      setChatData({
        chatSessionsToday,
        chatLimit,
        canStartChat,
        timeUntilReset: getTimeUntilReset()
      })
    } catch (error) {
      console.error('Error in fetchChatData:', error)
    }
  }

  // Update chat data when auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchChatData()
      setLoading(false)
    }
  }, [isAuthenticated, user, profile, authLoading, isSupabaseReachable])

  // Update time until reset every second
  useEffect(() => {
    const interval = setInterval(() => {
      setChatData(prev => ({
        ...prev,
        timeUntilReset: getTimeUntilReset()
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    role,
    isAuthenticated,
    canAccessCourses: role !== 'anonymous',
    canAccessPremiumContent: role === 'premium',
    chatData,
    loading: authLoading || loading
  }
}
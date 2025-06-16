import { supabase } from './supabase'
import { ChatSession, ChatSessionInput } from '../types/tavus'
import { tavusApi, promptTemplates } from './tavus'

export const chatSessionHelpers = {
  async createChatSession(userId: string, input: ChatSessionInput): Promise<ChatSession> {
    try {
      console.log('Creating chat session for user:', userId, 'with input:', input)

      // Create the session record in Supabase first
      const { data: session, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: userId,
          course_id: input.courseId,
          topic: input.topic,
          user_objective: input.learningObjective,
          difficulty_level: input.difficultyLevel,
          status: 'active'
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating session record:', sessionError)
        throw sessionError
      }

      console.log('Session record created:', session)

      // Generate prompts for Tavus
      const systemPrompt = promptTemplates.generateSystemPrompt(input.topic, input.difficultyLevel)
      const customGreeting = promptTemplates.generateCustomGreeting(
        input.topic, 
        input.learningObjective, 
        input.difficultyLevel
      )

      // Create Tavus conversation
      // Note: In production, this should use a real replica_id from your Tavus account
      const tavusRequest = {
        replica_id: 'demo_replica_id', // Replace with actual replica ID
        conversation_name: `${input.topic} Practice Session`,
        conversational_context: systemPrompt,
        custom_greeting: customGreeting,
        callback_url: `${window.location.origin}/api/tavus-webhook`, // For session end handling
        properties: {
          max_call_duration: 300, // 5 minutes
          participant_left_timeout: 30,
          participant_absent_timeout: 60,
          enable_recording: true,
          enable_transcription: true
        }
      }

      try {
        const tavusResponse = await tavusApi.createConversation(tavusRequest)
        
        // Update session with Tavus details
        const { data: updatedSession, error: updateError } = await supabase
          .from('ai_chat_sessions')
          .update({
            tavus_session_id: tavusResponse.conversation_id,
            result_url: tavusResponse.conversation_url
          })
          .eq('id', session.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating session with Tavus details:', updateError)
          throw updateError
        }

        console.log('Chat session created successfully:', updatedSession)
        return updatedSession
      } catch (tavusError) {
        console.error('Error creating Tavus conversation:', tavusError)
        
        // Update session status to failed
        await supabase
          .from('ai_chat_sessions')
          .update({ status: 'failed' })
          .eq('id', session.id)
        
        throw new Error('Failed to create AI conversation. Please try again.')
      }
    } catch (error) {
      console.error('Error in createChatSession:', error)
      throw error
    }
  },

  async endChatSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          duration_seconds: 300 // Will be updated by webhook with actual duration
        })
        .eq('id', sessionId)

      if (error) {
        console.error('Error ending chat session:', error)
        throw error
      }

      console.log('Chat session ended:', sessionId)
    } catch (error) {
      console.error('Error in endChatSession:', error)
      throw error
    }
  },

  async getUserChatSessions(userId: string, limit = 10): Promise<ChatSession[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching user chat sessions:', error)
        throw error
      }

      return sessions || []
    } catch (error) {
      console.error('Error in getUserChatSessions:', error)
      throw error
    }
  },

  async getTodaysChatCount(userId: string): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: sessions, error } = await supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('started_at', today.toISOString())
        .lt('started_at', tomorrow.toISOString())

      if (error) {
        console.error('Error fetching today\'s chat count:', error)
        return 0
      }

      return sessions?.length || 0
    } catch (error) {
      console.error('Error in getTodaysChatCount:', error)
      return 0
    }
  }
}
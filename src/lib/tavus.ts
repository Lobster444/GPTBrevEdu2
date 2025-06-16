import { supabaseUrl } from './supabase'

// CRITICAL: Validate environment variables
const tavusApiKey = import.meta.env.VITE_TAVUS_API_KEY
const tavusReplicaId = import.meta.env.VITE_TAVUS_REPLICA_ID

console.log('Tavus Environment Check:', {
  hasApiKey: !!tavusApiKey,
  hasReplicaId: !!tavusReplicaId,
  apiKey: tavusApiKey ? `${tavusApiKey.substring(0, 10)}...` : 'MISSING',
  replicaId: tavusReplicaId ? `${tavusReplicaId.substring(0, 10)}...` : 'MISSING'
})

// Tavus configuration object
export const tavusConfig = {
  getReplicaId: () => tavusReplicaId,
  getCallbackUrl: () => `${supabaseUrl}/functions/v1/tavus-webhook`
}

// Check if Tavus is properly configured
export const isTavusConfigured = (): boolean => {
  return !!(
    tavusApiKey && 
    tavusApiKey !== 'your_tavus_api_key' &&
    tavusReplicaId && 
    tavusReplicaId !== 'your_tavus_replica_id'
  )
}

// Validate configuration when API is used
const validateTavusConfig = () => {
  if (!tavusApiKey || tavusApiKey === 'your_tavus_api_key') {
    throw new Error('VITE_TAVUS_API_KEY is required. Please check your .env file.')
  }
  
  if (!tavusReplicaId || tavusReplicaId === 'your_tavus_replica_id') {
    throw new Error('VITE_TAVUS_REPLICA_ID is required. Please check your .env file.')
  }
}

// Tavus API types for My Conversations
export interface TavusConversationRequest {
  replica_id: string
  conversation_name: string
  conversational_context?: string
  custom_greeting?: string
  properties?: {
    max_call_duration?: number
    participant_left_timeout?: number
    participant_absent_timeout?: number
  }
}

export interface TavusConversationResponse {
  conversation_id: string
  conversation_url: string
  status: string
}

// Create Tavus conversation using My Conversations API
export const createTavusConversation = async (
  request: Omit<TavusConversationRequest, 'replica_id'>
): Promise<TavusConversationResponse> => {
  console.log('🔄 Creating Tavus conversation...')
  
  // Validate configuration before making API call
  validateTavusConfig()
  
  const payload: TavusConversationRequest = {
    replica_id: tavusReplicaId!,
    ...request,
    properties: {
      max_call_duration: 300, // 5 minutes default
      participant_left_timeout: 30,
      participant_absent_timeout: 60,
      ...request.properties,
    },
  }
  
  try {
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey!,
      },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Tavus API error:', response.status, errorData)
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Tavus conversation created:', data.conversation_id)
    return data
  } catch (error) {
    console.error('❌ Failed to create Tavus conversation:', error)
    throw error
  }
}

// End Tavus conversation
export const endTavusConversation = async (conversationId: string): Promise<void> => {
  console.log('🔄 Ending Tavus conversation:', conversationId)
  
  // Validate configuration before making API call
  validateTavusConfig()
  
  try {
    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey!,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Tavus end conversation error:', response.status, errorData)
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`)
    }
    
    console.log('✅ Tavus conversation ended:', conversationId)
  } catch (error) {
    console.error('❌ Failed to end Tavus conversation:', error)
    throw error
  }
}

// Prompt templates for different course topics and difficulty levels
export const promptTemplates = {
  generateSystemPrompt: (topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): string => {
    const basePrompt = `You are an AI coach helping someone practice ${topic} skills. `
    
    switch (difficulty) {
      case 'beginner':
        return basePrompt + 'Be encouraging, patient, and focus on fundamental concepts. Provide gentle feedback and simple, actionable advice.'
      case 'intermediate':
        return basePrompt + 'Challenge them with realistic scenarios and provide detailed feedback. Focus on practical application and skill refinement.'
      case 'advanced':
        return basePrompt + 'Engage in sophisticated discussions, present complex scenarios, and provide expert-level insights and feedback.'
      default:
        return basePrompt + 'Adapt your approach based on their responses and provide helpful, constructive feedback.'
    }
  },

  generateCustomGreeting: (topic: string, objective: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): string => {
    const levelText = difficulty === 'beginner' ? 'get started with' : difficulty === 'intermediate' ? 'improve your' : 'master advanced'
    return `Hi! I'm excited to help you ${levelText} ${topic} skills. I understand you want to ${objective}. Let's practice together and make this a great learning experience!`
  }
}

console.log('🚀 Tavus client initialized for My Conversations')
import { supabaseUrl } from './supabase'

// CRITICAL: Validate environment variables
const tavusApiKey = import.meta.env.VITE_TAVUS_API_KEY
const tavusReplicaId = import.meta.env.VITE_TAVUS_REPLICA_ID
const tavusPersonaId = import.meta.env.VITE_TAVUS_PERSONA_ID

console.log('Tavus Environment Check:', {
  hasApiKey: !!tavusApiKey,
  hasReplicaId: !!tavusReplicaId,
  hasPersonaId: !!tavusPersonaId,
  apiKey: tavusApiKey ? `${tavusApiKey.substring(0, 10)}...` : 'MISSING',
  replicaId: tavusReplicaId ? `${tavusReplicaId.substring(0, 10)}...` : 'MISSING',
  personaId: tavusPersonaId ? `${tavusPersonaId.substring(0, 10)}...` : 'MISSING'
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
    tavusReplicaId !== 'your_tavus_replica_id' &&
    tavusPersonaId && 
    tavusPersonaId !== 'your_tavus_persona_id'
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
  
  if (!tavusPersonaId || tavusPersonaId === 'your_tavus_persona_id') {
    throw new Error('VITE_TAVUS_PERSONA_ID is required. Please check your .env file.')
  }
}

// Tavus API types
export interface TavusConversationRequest {
  replica_id: string
  persona_id?: string
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

// Create Tavus conversation
export const createTavusConversation = async (
  request: Omit<TavusConversationRequest, 'replica_id' | 'persona_id'>
): Promise<TavusConversationResponse> => {
  console.log('🔄 Creating Tavus conversation...')
  
  // Validate configuration before making API call
  validateTavusConfig()
  
  const payload: TavusConversationRequest = {
    replica_id: tavusReplicaId!,
    persona_id: tavusPersonaId!,
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
  communication: {
    beginner: {
      context: "You are an AI communication coach helping a beginner practice basic communication skills. Be encouraging, patient, and provide gentle feedback.",
      greeting: "Hi! I'm excited to help you practice your communication skills. Let's start with some basic conversation techniques!"
    },
    intermediate: {
      context: "You are an AI communication coach working with someone who has some experience. Challenge them with more complex scenarios and provide detailed feedback.",
      greeting: "Welcome! Ready to take your communication skills to the next level? Let's dive into some challenging scenarios."
    },
    advanced: {
      context: "You are an AI communication coach for advanced practitioners. Focus on nuanced techniques, advanced strategies, and professional-level feedback.",
      greeting: "Great to see you! Let's work on mastering the subtle art of advanced communication techniques."
    }
  },
  productivity: {
    beginner: {
      context: "You are an AI productivity coach helping someone new to time management and productivity techniques. Focus on simple, actionable advice.",
      greeting: "Hello! Let's explore some simple but powerful productivity techniques that can transform your daily routine."
    },
    intermediate: {
      context: "You are an AI productivity coach working with someone who knows the basics. Introduce more sophisticated systems and methodologies.",
      greeting: "Welcome back! Ready to optimize your productivity systems and tackle more advanced time management strategies?"
    },
    advanced: {
      context: "You are an AI productivity coach for productivity experts. Discuss cutting-edge techniques, complex systems, and optimization strategies.",
      greeting: "Excellent! Let's dive deep into advanced productivity optimization and explore some cutting-edge methodologies."
    }
  },
  business: {
    beginner: {
      context: "You are an AI business coach helping someone new to business concepts. Explain fundamentals clearly and provide practical examples.",
      greeting: "Hi there! Let's explore essential business concepts that will give you a strong foundation for success."
    },
    intermediate: {
      context: "You are an AI business coach working with someone who understands the basics. Focus on strategy, growth, and more complex business scenarios.",
      greeting: "Welcome! Ready to tackle some strategic business challenges and explore growth opportunities?"
    },
    advanced: {
      context: "You are an AI business coach for experienced professionals. Discuss advanced strategies, market dynamics, and executive-level decision making.",
      greeting: "Great to connect! Let's analyze complex business scenarios and explore advanced strategic thinking."
    }
  },
  leadership: {
    beginner: {
      context: "You are an AI leadership coach helping someone new to leadership roles. Focus on fundamental leadership principles and basic team management.",
      greeting: "Hello! Let's explore the core principles of effective leadership and how to start building your leadership skills."
    },
    intermediate: {
      context: "You are an AI leadership coach working with someone who has some leadership experience. Focus on team dynamics, motivation, and conflict resolution.",
      greeting: "Welcome! Ready to enhance your leadership capabilities and tackle more complex team challenges?"
    },
    advanced: {
      context: "You are an AI leadership coach for senior leaders. Discuss organizational transformation, strategic leadership, and executive presence.",
      greeting: "Excellent! Let's explore advanced leadership strategies and discuss how to drive organizational excellence."
    }
  }
}

// Helper function to get prompt template
export const getPromptTemplate = (category: string, difficulty: 'beginner' | 'intermediate' | 'advanced') => {
  const categoryTemplates = promptTemplates[category as keyof typeof promptTemplates]
  if (!categoryTemplates) {
    // Default template for unknown categories
    return {
      context: `You are an AI coach helping someone practice ${category} skills at a ${difficulty} level. Be supportive and provide constructive feedback.`,
      greeting: `Hi! I'm here to help you practice your ${category} skills. Let's get started!`
    }
  }
  
  return categoryTemplates[difficulty]
}

console.log('🚀 Tavus client initialized')
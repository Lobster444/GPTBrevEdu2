import { TavusConversationRequest, TavusConversationResponse } from '../types/tavus'

const TAVUS_API_BASE = 'https://tavusapi.com/v2'

// Validate environment variables
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY
const TAVUS_REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID

if (!TAVUS_API_KEY || TAVUS_API_KEY === 'your_tavus_api_key') {
  console.error('❌ CRITICAL: VITE_TAVUS_API_KEY is missing or not configured')
  console.error('📝 Please update your .env file with your actual Tavus API key')
  console.error('🔗 Get it from: https://platform.tavus.io/')
  throw new Error('VITE_TAVUS_API_KEY is required. Please check your .env file.')
}

if (!TAVUS_REPLICA_ID || TAVUS_REPLICA_ID === 'your_tavus_replica_id') {
  console.error('❌ CRITICAL: VITE_TAVUS_REPLICA_ID is missing or not configured')
  console.error('📝 Please update your .env file with your actual Tavus replica ID')
  console.error('🔗 Get it from: https://platform.tavus.io/')
  throw new Error('VITE_TAVUS_REPLICA_ID is required. Please check your .env file.')
}

export const tavusApi = {
  async createConversation(request: TavusConversationRequest): Promise<TavusConversationResponse> {
    try {
      console.log('🔄 Creating Tavus conversation with request:', request)
      
      const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Tavus API error response:', errorText)
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Tavus conversation created:', data)
      return data
    } catch (error) {
      console.error('❌ Error creating Tavus conversation:', error)
      throw error
    }
  },

  async getConversation(conversationId: string): Promise<any> {
    try {
      console.log('🔄 Fetching Tavus conversation:', conversationId)
      
      const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}`, {
        headers: {
          'x-api-key': TAVUS_API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Tavus conversation fetched:', data)
      return data
    } catch (error) {
      console.error('❌ Error fetching Tavus conversation:', error)
      throw error
    }
  },

  async endConversation(conversationId: string): Promise<void> {
    try {
      console.log('🔄 Ending Tavus conversation:', conversationId)
      
      const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'x-api-key': TAVUS_API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`)
      }

      console.log('✅ Tavus conversation ended:', conversationId)
    } catch (error) {
      console.error('❌ Error ending Tavus conversation:', error)
      throw error
    }
  }
}

// Template functions for generating prompts
export const promptTemplates = {
  generateSystemPrompt(topic: string, difficultyLevel: string): string {
    return `You are an AI learning coach specializing in ${topic}. Your role is to help the user practice and reinforce their learning through interactive conversation.

Guidelines:
- Keep the conversation focused on ${topic}
- Adjust your language and examples to ${difficultyLevel} level
- Ask engaging questions to test understanding
- Provide constructive feedback and encouragement
- Use real-world scenarios and examples
- Keep responses concise and actionable (2-3 sentences max)
- End the session with key takeaways

The session should last approximately 5 minutes. Be encouraging and supportive while challenging the user to apply what they've learned.

Remember: This is a practice session, so create realistic scenarios for the user to work through.`
  },

  generateCustomGreeting(topic: string, learningObjective: string, difficultyLevel: string): string {
    return `Hi! I'm excited to help you practice ${topic} today. I understand you want to ${learningObjective}. 

Since you're at a ${difficultyLevel} level, I'll tailor our conversation accordingly. We have about 5 minutes together, so let's make the most of it!

To get started, can you tell me about a recent situation where you needed to use ${topic} skills? Or if you haven't had that experience yet, describe a scenario where you think these skills would be valuable.`
  }
}

// Configuration helper
export const tavusConfig = {
  getReplicaId: () => TAVUS_REPLICA_ID,
  getApiKey: () => TAVUS_API_KEY,
  isConfigured: () => !!(TAVUS_API_KEY && TAVUS_REPLICA_ID),
  getCallbackUrl: () => `${window.location.origin}/api/tavus-webhook`
}
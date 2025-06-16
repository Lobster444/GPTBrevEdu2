import { TavusConversationRequest, TavusConversationResponse } from '../types/tavus'

const TAVUS_API_BASE = 'https://tavusapi.com/v2'

// This should be stored in environment variables or Supabase Edge Functions
// For now, we'll use a placeholder that should be replaced with actual implementation
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY || 'placeholder_key'

export const tavusApi = {
  async createConversation(request: TavusConversationRequest): Promise<TavusConversationResponse> {
    try {
      console.log('Creating Tavus conversation with request:', request)
      
      // In production, this should be called through a Supabase Edge Function
      // to keep the API key secure
      const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Tavus conversation created:', data)
      return data
    } catch (error) {
      console.error('Error creating Tavus conversation:', error)
      throw error
    }
  },

  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}`, {
        headers: {
          'x-api-key': TAVUS_API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching Tavus conversation:', error)
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
- Keep responses concise and actionable
- End the session with key takeaways

The session should last approximately 5 minutes. Be encouraging and supportive while challenging the user to apply what they've learned.`
  },

  generateCustomGreeting(topic: string, learningObjective: string, difficultyLevel: string): string {
    return `Hi! I'm excited to help you practice ${topic} today. I understand you want to ${learningObjective}. 

Since you're at a ${difficultyLevel} level, I'll tailor our conversation accordingly. We have about 5 minutes together, so let's make the most of it!

To get started, can you tell me about a recent situation where you needed to use ${topic} skills? Or if you haven't had that experience yet, describe a scenario where you think these skills would be valuable.`
  }
}
import { supabase } from './supabase'
import { TavusConversationRequest, TavusConversationResponse } from '../types/tavus'

/**
 * Secure Tavus API wrapper using Supabase Edge Functions
 * This keeps API keys secure on the server side
 */
export const tavusEdgeApi = {
  async createConversation(request: TavusConversationRequest): Promise<TavusConversationResponse> {
    try {
      console.log('🔄 Creating Tavus conversation via Edge Function:', request)
      
      const { data, error } = await supabase.functions.invoke('create-tavus-conversation', {
        body: request,
      })

      if (error) {
        console.error('❌ Edge function error:', error)
        throw new Error(error.message || 'Failed to create conversation')
      }

      if (!data) {
        throw new Error('No response data from conversation service')
      }

      console.log('✅ Tavus conversation created via Edge Function:', data)
      return data
    } catch (error: any) {
      console.error('❌ Error in tavusEdgeApi.createConversation:', error)
      
      // Provide user-friendly error messages
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Authentication failed. Please sign in again.')
      } else if (error.message?.includes('403')) {
        throw new Error('Access denied. Please contact support.')
      } else if (error.message?.includes('429')) {
        throw new Error('Service is busy. Please try again in a few minutes.')
      } else if (error.message?.includes('500')) {
        throw new Error('Service temporarily unavailable. Please try again later.')
      } else {
        throw new Error(error.message || 'Failed to create AI conversation. Please try again.')
      }
    }
  }
}
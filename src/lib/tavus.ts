// Tavus API configuration and utilities
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID;

// Check if Tavus is properly configured
export const isTavusConfigured = (): boolean => {
  return !!(TAVUS_API_KEY && 
           TAVUS_API_KEY !== 'your_tavus_api_key' && 
           TAVUS_REPLICA_ID && 
           TAVUS_REPLICA_ID !== 'your_tavus_replica_id');
};

// Validate Tavus configuration before making API calls
const validateTavusConfig = (): void => {
  if (!isTavusConfigured()) {
    throw new Error('Tavus API is not properly configured. Please check your environment variables.');
  }
};

export interface TavusConversationRequest {
  replica_id: string;
  conversation_name: string;
  conversational_context?: string;
  callback_url?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    enable_transcription?: boolean;
    language?: string;
  };
}

export interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

export class TavusAPI {
  private apiKey: string;
  private baseUrl = 'https://tavusapi.com';

  constructor() {
    validateTavusConfig();
    this.apiKey = TAVUS_API_KEY!;
  }

  async createConversation(request: TavusConversationRequest): Promise<TavusConversationResponse> {
    const response = await fetch(`${this.baseUrl}/v2/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavus API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getConversation(conversationId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavus API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async endConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavus API error: ${response.status} - ${error}`);
    }
  }
}

// Export configured values for use in other modules
export { TAVUS_REPLICA_ID };
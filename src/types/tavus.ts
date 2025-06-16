export interface TavusConversationRequest {
  replica_id: string
  conversation_name?: string
  conversational_context?: string
  custom_greeting?: string
  callback_url?: string
  properties?: {
    max_call_duration?: number
    participant_left_timeout?: number
    participant_absent_timeout?: number
    enable_recording?: boolean
    enable_transcription?: boolean
  }
}

export interface TavusConversationResponse {
  conversation_id: string
  conversation_url: string
  status: string
  created_at: string
}

export interface ChatSessionInput {
  topic: string
  learningObjective: string
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  courseId?: string
}

export interface ChatSession {
  id: string
  user_id: string
  course_id?: string
  topic: string
  status: 'active' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  ended_at?: string
  duration_seconds?: number
  tavus_session_id?: string
  result_url?: string
  user_objective?: string
  difficulty_level?: string
  created_at: string
}
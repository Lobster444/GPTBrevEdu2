import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing'
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error)
  } else {
    console.log('Supabase connection test successful')
  }
})

// Database types
export interface Profile {
  id: string
  full_name: string
  role: 'anonymous' | 'free' | 'premium'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url?: string
  duration: number
  category: string
  is_premium: boolean
  is_featured: boolean
  is_published: boolean
  view_count: number
  rating?: number
  created_at: string
  updated_at: string
}

// Auth helper functions
export const authHelpers = {
  signUp: async (email: string, password: string, fullName: string) => {
    console.log('authHelpers.signUp: Attempting signup with:', { email, fullName });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    
    if (error) {
      console.error('authHelpers.signUp: Supabase signup error:', error);
      return { data: null, error };
    }

    console.log('authHelpers.signUp: Signup response:', data);
    return { data, error: null };
  },

  signIn: async (email: string, password: string) => {
    console.log('authHelpers.signIn: Attempting login with:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('authHelpers.signIn: Supabase login error:', error);
      return { data: null, error };
    }

    console.log('authHelpers.signIn: Login response:', data);
    return { data, error: null };
  },

  signOut: async () => {
    console.log('authHelpers.signOut: Signing out...');
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('authHelpers.signOut: Supabase logout error:', error);
    } else {
      console.log('authHelpers.signOut: Successfully signed out');
    }
    return { error }
  },

  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('authHelpers.getCurrentUser: Get current user error:', error);
    }
    return { data, error }
  },

  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('authHelpers.getCurrentSession: Get current session error:', error);
    }
    return { data, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helper functions
export const dbHelpers = {
  // Profile functions
  getProfile: async (userId: string) => {
    console.log('dbHelpers.getProfile: Getting profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('dbHelpers.getProfile: Error getting profile:', error);
    } else {
      console.log('dbHelpers.getProfile: Profile retrieved:', data);
    }
    
    return { data, error }
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    console.log('dbHelpers.updateProfile: Updating profile for user:', userId, updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('dbHelpers.updateProfile: Error updating profile:', error);
    } else {
      console.log('dbHelpers.updateProfile: Profile updated:', data);
    }
    
    return { data, error }
  },

  // Course functions
  getCourses: async (filters?: { category?: string; isPremium?: boolean; isPublished?: boolean }) => {
    let query = supabase.from('courses').select('*')
    
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.isPremium !== undefined) {
      query = query.eq('is_premium', filters.isPremium)
    }
    if (filters?.isPublished !== undefined) {
      query = query.eq('is_published', filters.isPublished)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    return { data, error }
  },

  getFeaturedCourses: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_featured', true)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  getCourse: async (courseId: string) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
    
    return { data, error }
  },

  // User progress functions
  getUserProgress: async (userId: string, courseId?: string) => {
    let query = supabase
      .from('user_course_progress')
      .select('*, courses(*)')
      .eq('user_id', userId)
    
    if (courseId) {
      query = query.eq('course_id', courseId)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  updateProgress: async (userId: string, courseId: string, progress: {
    watch_time_seconds?: number
    completion_percentage?: number
    completed?: boolean
  }) => {
    const { data, error } = await supabase
      .from('user_course_progress')
      .upsert({
        user_id: userId,
        course_id: courseId,
        ...progress,
        last_watched_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    return { data, error }
  },

  // AI Chat functions
  createChatSession: async (userId: string, courseId: string | null, topic: string, userObjective?: string, difficultyLevel?: string) => {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({
        user_id: userId,
        course_id: courseId,
        topic,
        user_objective: userObjective,
        difficulty_level: difficultyLevel || 'beginner',
        status: 'active',
      })
      .select()
      .single()
    
    return { data, error }
  },

  getUserChatSessions: async (userId: string) => {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*, courses(*)')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
    
    return { data, error }
  },

  updateChatSession: async (sessionId: string, updates: {
    status?: 'active' | 'completed' | 'failed' | 'cancelled'
    ended_at?: string
    duration_seconds?: number
    result_url?: string
  }) => {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()
    
    return { data, error }
  },

  // Check daily chat limit
  checkDailyChatLimit: async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('started_at', `${today}T00:00:00.000Z`)
      .lt('started_at', `${today}T23:59:59.999Z`)
    
    if (error) return { count: 0, error }
    
    return { count: data?.length || 0, error: null }
  },
}
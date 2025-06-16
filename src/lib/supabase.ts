import { createClient } from '@supabase/supabase-js'
import fetchRetry from 'fetch-retry'

// Environment variable validation
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'MISSING'
})

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 50 // JWT tokens are typically much longer than 50 characters
)

// Global connection state
export let isSupabaseOnline = false

// Handle missing or invalid environment variables gracefully
let finalSupabaseUrl = supabaseUrl
let finalSupabaseAnonKey = supabaseAnonKey

if (!isSupabaseConfigured) {
  console.error('❌ CRITICAL: Supabase environment variables are missing or not configured')
  console.error('📝 Please update your .env file with your actual Supabase credentials')
  console.error('🔗 Get them from: https://supabase.com/dashboard/project/your-project/settings/api')
  console.warn('💡 Steps to fix:')
  console.warn('   1. Copy .env.example to .env: cp .env.example .env')
  console.warn('   2. Edit .env with your Supabase URL and anon key')
  console.warn('   3. Restart the development server: npm run dev')
  
  // Use dummy values to prevent crashes - the app will show "Server Offline" instead
  finalSupabaseUrl = 'https://dummy.supabase.co'
  finalSupabaseAnonKey = 'dummy-key'
}

// Enhanced fetch with retry logic
const retryFetch = fetchRetry(fetch, {
  retries: 2,
  retryDelay: (attempt: number) => Math.pow(2, attempt) * 1000, // 1s, 2s, 4s
  retryOn: [408, 429, 500, 502, 503, 504, 'network-error', 'timeout']
})

// Create Supabase client with enhanced fetch and proper configuration
export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'brevedu-app'
    },
    fetch: retryFetch
  }
})

// Utility function for creating AbortController with timeout
const createTimeoutController = (timeoutMs: number): AbortController => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)
  
  // Clean up timeout when signal is aborted
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId)
  })
  
  return controller
}

// Enhanced retry wrapper with AbortController and better error handling
async function withRetry<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  operationName: string,
  timeoutMs = 5000,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = createTimeoutController(timeoutMs)
    
    try {
      console.log(`🔄 ${operationName} (attempt ${attempt}/${maxRetries})`)
      
      const result = await operation(controller.signal)
      
      console.log(`✅ ${operationName} succeeded on attempt ${attempt}`)
      return result
    } catch (error: any) {
      lastError = error
      
      // Check if it's an abort error (timeout)
      const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout')
      const isNetworkError = error.message?.includes('fetch') || 
                            error.message?.includes('network') ||
                            error.message?.includes('Failed to fetch')
      
      console.warn(`⚠️ ${operationName} failed on attempt ${attempt}:`, error.message)
      
      // Don't retry on certain errors (auth, client-side, etc.)
      if (!isTimeout && !isNetworkError && (
          error.message?.includes('Invalid API key') || 
          error.message?.includes('Project not found') ||
          error.message?.includes('401') ||
          error.message?.includes('403') ||
          error.message?.includes('JWT') ||
          error.message?.includes('Invalid login')
        )) {
        console.error(`❌ ${operationName} failed with non-retryable error:`, error.message)
        throw error
      }
      
      // If this was the last attempt, throw a descriptive error
      if (attempt === maxRetries) {
        console.error(`❌ ${operationName} failed after ${maxRetries} attempts`)
        
        if (isTimeout) {
          throw new Error(`${operationName} timeout after ${timeoutMs}ms`)
        } else if (isNetworkError) {
          throw new Error(`${operationName} network error: ${error.message}`)
        } else {
          throw new Error(`${operationName} failed: ${error.message}`)
        }
      }
      
      // Wait before retrying (exponential backoff)
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      console.log(`⏳ Retrying ${operationName} in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    } finally {
      // Ensure controller is cleaned up
      if (!controller.signal.aborted) {
        controller.abort()
      }
    }
  }
  
  throw lastError || new Error(`${operationName} failed after all retries`)
}

// Test connection function with enhanced error handling
export const testConnection = async (timeoutMs = 5000): Promise<boolean> => {
  // Immediately return false if Supabase is not configured
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase connection test skipped: Environment variables not configured')
    isSupabaseOnline = false
    return false
  }

  try {
    await withRetry(
      async (signal: AbortSignal) => {
        // Use a simple query to test the connection
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .abortSignal(signal)
        
        // RLS errors are expected and indicate connection is working
        if (error && !error.message.includes('RLS') && !error.message.includes('policy')) {
          throw error
        }
        return true
      },
      'Supabase connection test',
      timeoutMs,
      2 // Fewer retries for connection test
    )
    
    console.log('✅ Supabase connection test: SUCCESS')
    isSupabaseOnline = true
    return true
  } catch (error: any) {
    console.error('❌ Supabase connection test failed:', error.message)
    isSupabaseOnline = false
    return false
  }
}

// Profile interface
export interface Profile {
  id: string
  full_name: string
  role: 'free' | 'premium'
  avatar_url?: string
  created_at: string
  updated_at: string
  email?: string
}

// Database helpers with enhanced retry logic and AbortController
export const dbHelpers = {
  async getProfile(userId: string, timeoutMs = 8000): Promise<{ data: Profile | null; error: any }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured') }
    }

    try {
      const result = await withRetry(
        async (signal: AbortSignal) => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
            .abortSignal(signal)
          
          if (error) throw error
          return { data, error: null }
        },
        `Profile fetch for user ${userId.substring(0, 8)}...`,
        timeoutMs,
        3
      )
      
      console.log('✅ Profile fetch result:', result.data ? 'SUCCESS' : 'NO_PROFILE_FOUND')
      return result
    } catch (error: any) {
      console.error('❌ Profile fetch failed:', error.message)
      return { data: null, error }
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null; error: any }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured') }
    }

    try {
      const result = await withRetry(
        async (signal: AbortSignal) => {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .maybeSingle()
            .abortSignal(signal)
          
          if (error) throw error
          return { data, error: null }
        },
        `Profile update for user ${userId.substring(0, 8)}...`,
        8000,
        3
      )
      
      console.log('✅ Profile update result:', result.data ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error: any) {
      console.error('❌ Profile update failed:', error.message)
      return { data: null, error }
    }
  }
}

// Auth helpers with enhanced retry logic
export const authHelpers = {
  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      const result = await withRetry(
        async (signal: AbortSignal) => {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })
          
          if (error) throw error
          return { data, error: null }
        },
        'User signup',
        10000,
        2
      )
      
      console.log('✅ Signup result:', result.data.user ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error: any) {
      console.error('❌ Signup failed:', error.message)
      throw error
    }
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      const result = await withRetry(
        async (signal: AbortSignal) => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) throw error
          return { data, error: null }
        },
        'User signin',
        10000,
        2
      )
      
      console.log('✅ Signin result:', result.data.user ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error: any) {
      console.error('❌ Signin failed:', error.message)
      throw error
    }
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      const result = await withRetry(
        async (signal: AbortSignal) => {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          return { error: null }
        },
        'User signout',
        5000,
        2
      )
      
      console.log('✅ Signout result: SUCCESS')
      return result
    } catch (error: any) {
      console.error('❌ Signout failed:', error.message)
      throw error
    }
  }
}

// Connection retry helper for UI components
export const retryConnection = async (): Promise<boolean> => {
  console.log('🔄 Manual connection retry requested...')
  const isConnected = await testConnection()
  isSupabaseOnline = isConnected
  return isConnected
}

// Initialize connection test on module load
console.log('🚀 Initializing Supabase client...')
if (isSupabaseConfigured) {
  testConnection().then(isConnected => {
    isSupabaseOnline = isConnected
    if (isConnected) {
      console.log('🎉 Supabase client initialized successfully!')
    } else {
      console.warn('⚠️ Supabase connection test failed during initialization')
    }
  }).catch(error => {
    console.error('💥 Critical error during Supabase initialization:', error)
    isSupabaseOnline = false
  })
} else {
  console.warn('⚠️ Supabase client initialized with dummy values due to missing configuration')
  isSupabaseOnline = false
}
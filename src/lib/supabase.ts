import { createClient } from '@supabase/supabase-js'

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

// Create Supabase client with proper configuration
export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  // Add timeout configuration to prevent hanging requests
  global: {
    headers: {
      'X-Client-Info': 'brevedu-app'
    }
  }
})

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
  backoffMultiplier: 2
}

// Utility function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Enhanced retry wrapper with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  timeoutMs = 10000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} (attempt ${attempt}/${RETRY_CONFIG.maxRetries})`)
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${operationName} timeout after ${timeoutMs}ms`)), timeoutMs)
      )
      
      // Race the operation against timeout
      const result = await Promise.race([operation(), timeoutPromise])
      
      console.log(`✅ ${operationName} succeeded on attempt ${attempt}`)
      return result
    } catch (error: any) {
      lastError = error
      console.warn(`⚠️ ${operationName} failed on attempt ${attempt}:`, error.message)
      
      // Don't retry on certain errors
      if (error.message?.includes('Invalid API key') || 
          error.message?.includes('Project not found') ||
          error.message?.includes('401') ||
          error.message?.includes('403')) {
        console.error(`❌ ${operationName} failed with non-retryable error:`, error.message)
        throw error
      }
      
      // If this was the last attempt, throw the error
      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(`❌ ${operationName} failed after ${RETRY_CONFIG.maxRetries} attempts`)
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelay
      )
      
      console.log(`⏳ Retrying ${operationName} in ${delayMs}ms...`)
      await delay(delayMs)
    }
  }
  
  throw lastError || new Error(`${operationName} failed after all retries`)
}

// Test connection function with retry logic
export const testConnection = async (timeoutMs = 8000): Promise<boolean> => {
  // Immediately return false if Supabase is not configured
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase connection test skipped: Environment variables not configured')
    return false
  }

  try {
    await withRetry(
      async () => {
        // Use a simple query to test the connection
        const { error } = await supabase.from('profiles').select('id').limit(1)
        if (error && !error.message.includes('RLS')) {
          throw error
        }
        return true
      },
      'Supabase connection test',
      timeoutMs
    )
    
    console.log('✅ Supabase connection test: SUCCESS')
    return true
  } catch (error: any) {
    console.error('❌ Supabase connection test failed after retries:', error.message)
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

// Database helpers with retry logic
export const dbHelpers = {
  async getProfile(userId: string, timeoutMs = 15000): Promise<{ data: Profile | null; error: any }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured') }
    }

    try {
      const result = await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
          
          if (error) throw error
          return { data, error: null }
        },
        `Profile fetch for user ${userId}`,
        timeoutMs
      )
      
      console.log('✅ Profile fetch result:', result.data ? 'SUCCESS' : 'NO_PROFILE_FOUND')
      return result
    } catch (error: any) {
      console.error('❌ Profile fetch failed after retries:', error.message)
      return { data: null, error }
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null; error: any }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured') }
    }

    try {
      const result = await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .maybeSingle()
          
          if (error) throw error
          return { data, error: null }
        },
        `Profile update for user ${userId}`,
        10000
      )
      
      console.log('✅ Profile update result:', result.data ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error: any) {
      console.error('❌ Profile update failed after retries:', error.message)
      return { data: null, error }
    }
  }
}

// Auth helpers with retry logic
export const authHelpers = {
  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      const result = await withRetry(
        async () => {
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
        15000
      )
      
      console.log('✅ Signup result:', result.data.user ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error: any) {
      console.error('❌ Signup failed after retries:', error.message)
      throw error
    }
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      const result = await withRetry(
        async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) throw error
          return { data, error: null }
        },
        'User signin',
        15000
      )
      
      console.log('✅ Signin result:', result.data.user ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error: any) {
      console.error('❌ Signin failed after retries:', error.message)
      throw error
    }
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      const result = await withRetry(
        async () => {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          return { error: null }
        },
        'User signout',
        10000
      )
      
      console.log('✅ Signout result: SUCCESS')
      return result
    } catch (error: any) {
      console.error('❌ Signout failed after retries:', error.message)
      throw error
    }
  }
}

// Connection retry helper for UI components
export const retryConnection = async (): Promise<boolean> => {
  console.log('🔄 Manual connection retry requested...')
  return await testConnection()
}

// Initialize connection test on module load
console.log('🚀 Initializing Supabase client...')
if (isSupabaseConfigured) {
  testConnection().then(isConnected => {
    if (isConnected) {
      console.log('🎉 Supabase client initialized successfully!')
    } else {
      console.warn('⚠️ Supabase connection test failed during initialization')
    }
  }).catch(error => {
    console.error('💥 Critical error during Supabase initialization:', error)
  })
} else {
  console.warn('⚠️ Supabase client initialized with dummy values due to missing configuration')
}
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
  console.warn('💡 You can create .env from .env.example and set your Supabase keys.')
  console.warn('🔄 After updating .env, restart the development server with: npm run dev')
  
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

// Test connection function with improved timeout handling
export const testConnection = async (timeoutMs = 10000): Promise<boolean> => {
  // Immediately return false if Supabase is not configured
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase connection test skipped: Environment variables not configured')
    return false
  }

  try {
    console.log('🔄 Testing Supabase connection...')
    
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
    )
    
    // Use a simple auth check instead of getSession for faster response
    const connectionPromise = supabase.auth.getUser()
    
    await Promise.race([connectionPromise, timeoutPromise])
    
    console.log('✅ Supabase connection test: SUCCESS')
    return true
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
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
}

// Database helpers with improved timeout protection
export const dbHelpers = {
  async getProfile(userId: string, timeoutMs = 10000): Promise<{ data: Profile | null; error: any }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured') }
    }

    try {
      console.log('🔄 Fetching profile for user:', userId)
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeoutMs)
      )
      
      // CRITICAL FIX: Use maybeSingle() instead of single() to handle cases where no profile exists
      // This prevents PGRST116 errors when a profile legitimately doesn't exist
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      const result = await Promise.race([profilePromise, timeoutPromise])
      
      console.log('✅ Profile fetch result:', result.data ? 'SUCCESS' : 'NO_PROFILE_FOUND')
      return result
    } catch (error) {
      console.error('❌ Profile fetch failed:', error)
      return { data: null, error }
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null; error: any }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase not configured') }
    }

    try {
      console.log('🔄 Updating profile for user:', userId)
      
      const result = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle()
      
      console.log('✅ Profile update result:', result.data ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error) {
      console.error('❌ Profile update failed:', error)
      return { data: null, error }
    }
  }
}

// Auth helpers with improved error handling
export const authHelpers = {
  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      console.log('🔄 Starting signup process...')
      
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      
      console.log('✅ Signup result:', result.data.user ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error) {
      console.error('❌ Signup failed:', error)
      throw error
    }
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      console.log('🔄 Starting signin process...')
      
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('✅ Signin result:', result.data.user ? 'SUCCESS' : 'FAILED')
      return result
    } catch (error) {
      console.error('❌ Signin failed:', error)
      throw error
    }
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured. Please check your environment variables.')
    }

    try {
      console.log('🔄 Starting signout process...')
      
      const result = await supabase.auth.signOut()
      
      console.log('✅ Signout result: SUCCESS')
      return result
    } catch (error) {
      console.error('❌ Signout failed:', error)
      throw error
    }
  }
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
import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, dbHelpers, Profile, testConnection, isSupabaseConfigured, retryConnection, isSupabaseOnline } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isSupabaseReachable: boolean
  connectionError: string | null
  retryConnection: () => Promise<void>
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    isSupabaseReachable: isSupabaseOnline,
    connectionError: null,
    retryConnection: async () => {}
  })

  const handleRetryConnection = async () => {
    console.log('🔄 User requested connection retry...')
    setAuthState(prev => ({ ...prev, loading: true, connectionError: null }))
    
    try {
      const isConnected = await retryConnection()
      
      if (isConnected) {
        console.log('✅ Connection restored, reinitializing session...')
        // If connection is restored, try to get the session again
        await getInitialSession()
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          isSupabaseReachable: false,
          connectionError: 'Connection retry failed. Please check your network and try again.'
        }))
      }
    } catch (error: any) {
      console.error('Connection retry failed:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        isSupabaseReachable: false,
        connectionError: 'Connection retry failed. Please check your network and try again.'
      }))
    }
  }

  // Get initial session with comprehensive error handling
  const getInitialSession = async () => {
    try {
      console.log('useAuth: Getting initial session...')
      
      // Check if Supabase is configured first
      if (!isSupabaseConfigured) {
        console.error('useAuth: Supabase is not configured')
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
          isSupabaseReachable: false,
          connectionError: 'Supabase is not configured. Please check your .env file and restart the server.',
          retryConnection: handleRetryConnection
        }))
        return
      }
      
      // Test if Supabase is reachable with shorter timeout for initial check
      const isReachable = await testConnection(5000)
      
      if (!isReachable) {
        console.error('useAuth: Supabase is not reachable')
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
          isSupabaseReachable: false,
          connectionError: 'Unable to connect to our servers. Please check your internet connection.',
          retryConnection: handleRetryConnection
        }))
        return
      }
      
      // Get session with proper error handling
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('useAuth: Error getting session:', error)
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
          isSupabaseReachable: false,
          connectionError: 'Authentication service is currently unavailable.',
          retryConnection: handleRetryConnection
        }))
        return
      }

      console.log('useAuth: Initial session:', session ? 'Found' : 'None')

      if (session?.user) {
        console.log('useAuth: User found, getting profile...')
        
        // Get profile with enhanced error handling
        let profile = null
        let profileError = null
        
        try {
          const { data: profileData, error: fetchError } = await dbHelpers.getProfile(session.user.id, 8000)
          if (fetchError) {
            console.error('useAuth: Error getting profile:', fetchError)
            profileError = fetchError
          } else {
            console.log('useAuth: Profile loaded:', profileData ? 'SUCCESS' : 'NO_PROFILE')
            profile = profileData
          }
        } catch (error) {
          console.error('useAuth: Profile fetch failed:', error)
          profileError = error
        }

        // Set auth state - allow authentication even if profile fails
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          profile,
          loading: false,
          isAuthenticated: true,
          isSupabaseReachable: true,
          connectionError: profileError ? 'Profile data temporarily unavailable' : null,
          retryConnection: handleRetryConnection
        }))
      } else {
        console.log('useAuth: No user session found')
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
          isSupabaseReachable: true,
          connectionError: null,
          retryConnection: handleRetryConnection
        }))
      }
    } catch (error: any) {
      console.error('useAuth: Error in getInitialSession:', error)
      
      // Determine error type for better user messaging
      const isTimeoutError = error.message?.includes('timeout')
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network')
      
      let errorMessage = 'An unexpected error occurred. Please refresh the page.'
      if (isTimeoutError) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.'
      } else if (isNetworkError) {
        errorMessage = 'Network error. Please check your internet connection.'
      }
      
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        profile: null,
        loading: false,
        isAuthenticated: false,
        isSupabaseReachable: false,
        connectionError: errorMessage,
        retryConnection: handleRetryConnection
      }))
    }
  }

  useEffect(() => {
    getInitialSession()

    // Listen for auth changes with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session?.user?.id)
        
        try {
          if (session?.user) {
            console.log('useAuth: User signed in, getting profile...')
            
            // Get profile with timeout and error handling
            let profile = null
            try {
              const { data: profileData, error: profileError } = await dbHelpers.getProfile(session.user.id, 8000)
              if (profileError) {
                console.error('useAuth: Error getting profile after auth change:', profileError)
              } else {
                console.log('useAuth: Profile loaded after auth change:', profileData ? 'SUCCESS' : 'NO_PROFILE')
                profile = profileData
              }
            } catch (profileError) {
              console.error('useAuth: Profile fetch failed after auth change:', profileError)
            }

            // Update auth state - allow authentication even if profile fails
            setAuthState(prev => ({
              ...prev,
              user: session.user,
              session,
              profile,
              loading: false,
              isAuthenticated: true,
              isSupabaseReachable: true,
              connectionError: null,
              retryConnection: handleRetryConnection
            }))
          } else {
            console.log('useAuth: User signed out')
            setAuthState(prev => ({
              ...prev,
              user: null,
              session: null,
              profile: null,
              loading: false,
              isAuthenticated: false,
              isSupabaseReachable: true,
              connectionError: null,
              retryConnection: handleRetryConnection
            }))
          }
        } catch (error: any) {
          console.error('useAuth: Error in auth state change handler:', error)
          
          // Don't completely break auth state on profile errors
          const hasValidSession = session?.user
          
          setAuthState(prev => ({
            ...prev,
            user: hasValidSession ? session.user : prev.user,
            session: hasValidSession ? session : prev.session,
            loading: false,
            isAuthenticated: hasValidSession || prev.isAuthenticated,
            connectionError: 'Profile service temporarily unavailable',
            retryConnection: handleRetryConnection
          }))
        }
      }
    )

    return () => {
      console.log('useAuth: Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (authState.user && authState.isSupabaseReachable) {
      console.log('useAuth: Refreshing profile...')
      try {
        const { data: profile, error } = await dbHelpers.getProfile(authState.user.id, 8000)
        if (!error) {
          console.log('useAuth: Profile refreshed:', profile ? 'SUCCESS' : 'NO_PROFILE')
          setAuthState(prev => ({ ...prev, profile, connectionError: null }))
        } else {
          console.error('useAuth: Error refreshing profile:', error)
          setAuthState(prev => ({ ...prev, connectionError: 'Profile refresh failed' }))
        }
      } catch (error) {
        console.error('useAuth: Profile refresh failed:', error)
        setAuthState(prev => ({ ...prev, connectionError: 'Profile refresh failed' }))
      }
    }
  }

  // DEBUG: Log current auth state (less verbose)
  console.log('useAuth: State:', {
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    isSupabaseReachable: authState.isSupabaseReachable,
    hasUser: !!authState.user,
    hasProfile: !!authState.profile,
    hasError: !!authState.connectionError
  })

  return {
    ...authState,
    refreshProfile,
  }
}
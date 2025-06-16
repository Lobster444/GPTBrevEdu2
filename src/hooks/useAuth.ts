import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, dbHelpers, Profile, testConnection } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isSupabaseReachable: boolean
  connectionError: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    isSupabaseReachable: true,
    connectionError: null,
  })

  useEffect(() => {
    // Get initial session with comprehensive error handling
    const getInitialSession = async () => {
      try {
        console.log('useAuth: Getting initial session...')
        
        // First test if Supabase is reachable
        const isReachable = await testConnection(8000)
        
        if (!isReachable) {
          console.error('useAuth: Supabase is not reachable')
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
            isSupabaseReachable: false,
            connectionError: 'Unable to connect to our servers. Please check your internet connection and try again.',
          })
          return
        }
        
        // CRITICAL FIX: Proper timeout handling with Promise.race
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 8000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        
        const result = await Promise.race([sessionPromise, timeoutPromise])
        
        const { data: { session }, error } = result
        
        if (error) {
          console.error('useAuth: Error getting session:', error)
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
            isSupabaseReachable: false,
            connectionError: 'Authentication service is currently unavailable.',
          })
          return
        }

        console.log('useAuth: Initial session:', session ? 'Found' : 'None')

        if (session?.user) {
          console.log('useAuth: User found, getting profile...')
          
          // CRITICAL FIX: Don't let profile fetch block the auth state
          let profile = null
          let profileError = null
          
          try {
            const { data: profileData, error: fetchError } = await dbHelpers.getProfile(session.user.id, 6000)
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

          // CRITICAL FIX: Set auth state regardless of profile success/failure
          setAuthState({
            user: session.user,
            session,
            profile,
            loading: false,
            isAuthenticated: true,
            isSupabaseReachable: true,
            connectionError: profileError ? 'Profile data temporarily unavailable' : null,
          })
        } else {
          console.log('useAuth: No user session found')
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
            isSupabaseReachable: true,
            connectionError: null,
          })
        }
      } catch (error) {
        console.error('useAuth: Error in getInitialSession:', error)
        
        // CRITICAL FIX: Always set loading to false on any error
        const isTimeoutError = error instanceof Error && error.message.includes('timeout')
        
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
          isSupabaseReachable: !isTimeoutError,
          connectionError: isTimeoutError 
            ? 'Connection timeout. Please check your internet connection and try again.'
            : 'An unexpected error occurred. Please refresh the page.',
        })
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session?.user?.id)
        
        try {
          if (session?.user) {
            console.log('useAuth: User signed in, getting profile...')
            
            // CRITICAL FIX: Don't block auth state update on profile fetch
            let profile = null
            try {
              const { data: profileData, error: profileError } = await dbHelpers.getProfile(session.user.id, 6000)
              if (profileError) {
                console.error('useAuth: Error getting profile after auth change:', profileError)
              } else {
                console.log('useAuth: Profile loaded after auth change:', profileData ? 'SUCCESS' : 'NO_PROFILE')
                profile = profileData
              }
            } catch (profileError) {
              console.error('useAuth: Profile fetch failed after auth change:', profileError)
            }

            // CRITICAL FIX: Always update auth state, with or without profile
            setAuthState({
              user: session.user,
              session,
              profile,
              loading: false,
              isAuthenticated: true,
              isSupabaseReachable: true,
              connectionError: null,
            })
          } else {
            console.log('useAuth: User signed out')
            setAuthState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              isAuthenticated: false,
              isSupabaseReachable: true,
              connectionError: null,
            })
          }
        } catch (error) {
          console.error('useAuth: Error in auth state change handler:', error)
          
          // Don't update auth state on error, keep current state
          setAuthState(prev => ({
            ...prev,
            loading: false,
            connectionError: 'Authentication service temporarily unavailable',
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
        const { data: profile, error } = await dbHelpers.getProfile(authState.user.id)
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

  // DEBUG: Log current auth state
  console.log('useAuth: Current state:', {
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    isSupabaseReachable: authState.isSupabaseReachable,
    hasUser: !!authState.user,
    hasProfile: !!authState.profile,
    connectionError: authState.connectionError
  })

  return {
    ...authState,
    refreshProfile,
  }
}
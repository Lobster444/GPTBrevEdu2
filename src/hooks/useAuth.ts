import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, dbHelpers, Profile } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('useAuth: Getting initial session...')
        
        // CRITICAL FIX: Increase timeout from 10000ms to 30000ms
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 30000)
        )
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any
        
        if (error) {
          console.error('useAuth: Error getting session:', error)
          // CRITICAL FIX: Always set loading to false on error
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
          })
          return
        }

        console.log('useAuth: Initial session:', session ? 'Found' : 'None')

        if (session?.user) {
          console.log('useAuth: User found, getting profile...')
          
          // CRITICAL FIX: Don't let profile fetch block the auth state
          try {
            const { data: profile, error: profileError } = await dbHelpers.getProfile(session.user.id)
            if (profileError) {
              console.error('useAuth: Error getting profile:', profileError)
              // Continue without profile - don't block authentication
            } else {
              console.log('useAuth: Profile loaded:', profile)
            }

            // CRITICAL FIX: Set auth state regardless of profile success/failure
            setAuthState({
              user: session.user,
              session,
              profile: profile || null,
              loading: false,
              isAuthenticated: true,
            })
          } catch (profileError) {
            console.error('useAuth: Profile fetch failed:', profileError)
            // Still set user as authenticated even if profile fails
            setAuthState({
              user: session.user,
              session,
              profile: null,
              loading: false,
              isAuthenticated: true,
            })
          }
        } else {
          console.log('useAuth: No user session found')
          // CRITICAL FIX: Always set loading to false
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('useAuth: Error in getInitialSession:', error)
        // CRITICAL FIX: Always set loading to false on any error
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          console.log('useAuth: User signed in, getting profile...')
          
          // CRITICAL FIX: Don't block auth state update on profile fetch
          let profile = null
          try {
            const { data: profileData, error: profileError } = await dbHelpers.getProfile(session.user.id)
            if (profileError) {
              console.error('useAuth: Error getting profile after auth change:', profileError)
            } else {
              console.log('useAuth: Profile loaded after auth change:', profileData)
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
          })
        } else {
          console.log('useAuth: User signed out')
          // CRITICAL FIX: Always set loading to false
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
          })
        }
      }
    )

    return () => {
      console.log('useAuth: Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (authState.user) {
      console.log('useAuth: Refreshing profile...')
      try {
        const { data: profile, error } = await dbHelpers.getProfile(authState.user.id)
        if (!error && profile) {
          console.log('useAuth: Profile refreshed:', profile)
          setAuthState(prev => ({ ...prev, profile }))
        } else {
          console.error('useAuth: Error refreshing profile:', error)
        }
      } catch (error) {
        console.error('useAuth: Profile refresh failed:', error)
      }
    }
  }

  // DEBUG: Log current auth state
  console.log('useAuth: Current state:', {
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    hasUser: !!authState.user,
    hasProfile: !!authState.profile
  })

  return {
    ...authState,
    refreshProfile,
  }
}
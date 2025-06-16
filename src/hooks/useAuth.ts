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
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('useAuth: Error getting session:', error)
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
          // Get user profile
          const { data: profile, error: profileError } = await dbHelpers.getProfile(session.user.id)
          if (profileError) {
            console.error('useAuth: Error getting profile:', profileError)
          } else {
            console.log('useAuth: Profile loaded:', profile)
          }

          setAuthState({
            user: session.user,
            session,
            profile: profile || null,
            loading: false,
            isAuthenticated: true,
          })
        } else {
          console.log('useAuth: No user session found')
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
          // Get user profile when user signs in
          const { data: profile, error: profileError } = await dbHelpers.getProfile(session.user.id)
          if (profileError) {
            console.error('useAuth: Error getting profile after auth change:', profileError)
          } else {
            console.log('useAuth: Profile loaded after auth change:', profile)
          }

          setAuthState({
            user: session.user,
            session,
            profile: profile || null,
            loading: false,
            isAuthenticated: true,
          })
        } else {
          console.log('useAuth: User signed out')
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
      const { data: profile, error } = await dbHelpers.getProfile(authState.user.id)
      if (!error && profile) {
        console.log('useAuth: Profile refreshed:', profile)
        setAuthState(prev => ({ ...prev, profile }))
      } else {
        console.error('useAuth: Error refreshing profile:', error)
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
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
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
          })
          return
        }

        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await dbHelpers.getProfile(session.user.id)
          if (profileError) {
            console.error('Error getting profile:', profileError)
          }

          setAuthState({
            user: session.user,
            session,
            profile: profile || null,
            loading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
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
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          // Get user profile when user signs in
          const { data: profile, error: profileError } = await dbHelpers.getProfile(session.user.id)
          if (profileError) {
            console.error('Error getting profile after auth change:', profileError)
          }

          setAuthState({
            user: session.user,
            session,
            profile: profile || null,
            loading: false,
            isAuthenticated: true,
          })
        } else {
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

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (authState.user) {
      const { data: profile, error } = await dbHelpers.getProfile(authState.user.id)
      if (!error && profile) {
        setAuthState(prev => ({ ...prev, profile }))
      }
    }
  }

  return {
    ...authState,
    refreshProfile,
  }
}
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

// Manages Supabase authentication state for the whole app.
// Returns the current user, a loading flag, any auth error, and auth actions.
function useAuth() {
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)  // true while we check for an existing session
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    // Check whether a session already exists (e.g. after a page refresh).
    // Supabase stores the session in localStorage automatically.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to future auth events: sign in, sign out, token refresh.
    // This keeps `user` in sync without any manual polling.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Clean up the listener when the component that called this hook unmounts
    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password) {
    setAuthError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setAuthError(error.message)
    // Returns true on success so the form can show a confirmation message
    return !error
  }

  async function signIn(email, password) {
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    return !error
  }

  async function signOut() {
    await supabase.auth.signOut()
    // onAuthStateChange will fire and set user to null automatically
  }

  return { user, loading, authError, signUp, signIn, signOut }
}

export default useAuth

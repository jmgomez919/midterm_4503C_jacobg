import React, { useState } from 'react'

// AuthForm handles both Sign In and Sign Up in a single component.
// Mode is toggled with the tab buttons at the top.
// Props:
//   onSignIn  — async (email, password) => bool
//   onSignUp  — async (email, password) => bool
//   error     — auth error string from useAuth (empty string when no error)
function AuthForm({ onSignIn, onSignUp, error }) {
  const [mode, setMode]         = useState('signin') // 'signin' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMsg('')

    if (mode === 'signup') {
      const ok = await onSignUp(email, password)
      // Supabase sends a confirmation email by default.
      // Let the user know to check their inbox before signing in.
      if (ok) setSuccessMsg('Account created! Check your email to confirm, then sign in.')
    } else {
      await onSignIn(email, password)
    }

    setSubmitting(false)
  }

  function switchMode(next) {
    setMode(next)
    setSuccessMsg('')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1 className="app-title">MyLiterary</h1>
        <p className="app-subtitle">Track the movies and books you love</p>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'signin' ? 'auth-tab-active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'auth-tab-active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Error comes from useAuth (Supabase error messages) */}
          {error && <p className="form-error">{error}</p>}

          {/* Success shown after successful sign-up before email confirmation */}
          {successMsg && <p className="auth-success">{successMsg}</p>}

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting
              ? 'Please wait...'
              : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthForm

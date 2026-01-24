"use client"
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    })
    if (res.ok) {
      window.location.href = '/auth/signin'
    } else {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Sign up failed')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign Up</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Create Account</button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
      <p>¿Ya tenés cuenta? <a href="/auth/signin">Sign In</a></p>
    </main>
  )
}

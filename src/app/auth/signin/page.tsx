"use client"
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      window.location.href = '/dashboard'
    } else {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Login failed')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign In</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Sign In</button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
      <p>¿No tenés cuenta? <a href="/auth/signup">Sign Up</a></p>
    </main>
  )
}

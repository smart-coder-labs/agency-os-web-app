"use client"
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/auth/signin', {
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
    <div className="max-w-md mx-auto bg-white shadow-sm border border-gray-200 rounded-lg p-6 space-y-4">
      <h1 className="text-xl font-semibold">Sign In</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input className="border rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Password</span>
          <input className="border rounded-md px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700" type="submit">Sign In</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
      <p className="text-sm">¿No tenés cuenta? <a className="text-blue-600" href="/auth/signup">Sign Up</a></p>
    </div>
  )
}

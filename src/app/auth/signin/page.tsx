"use client"
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

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
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <Button type="submit">Sign In</Button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
      <p className="text-sm">¿No tenés cuenta? <a className="text-blue-600" href="/auth/signup">Sign Up</a></p>
    </div>
  )
}

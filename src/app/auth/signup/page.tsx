"use client"
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/auth/signup', {
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
    <div className="max-w-md mx-auto bg-white shadow-sm border border-gray-200 rounded-lg p-6 space-y-4">
      <h1 className="text-xl font-semibold">Sign Up</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <Button type="submit">Create Account</Button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
      <p className="text-sm">¿Ya tenés cuenta? <a className="text-blue-600" href="/auth/signin">Sign In</a></p>
    </div>
  )
}

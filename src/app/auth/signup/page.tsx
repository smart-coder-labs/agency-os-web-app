"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Simulate min delay for UX
    const minDelay = new Promise(resolve => setTimeout(resolve, 800));

    try {
        const [res] = await Promise.all([
             fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fullName })
             }),
             minDelay
        ]);

        if (res.ok) {
            window.location.href = '/auth/signin'
        } else {
            const j = await res.json().catch(() => ({}))
            setError(j.error || 'Sign up failed')
        }
    } catch (err) {
        setError('An unexpected error occurred')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F7] p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-8 md:p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-8 space-y-2">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500">Join Agency OS today</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
            <Input 
                label="Full name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                type="text" 
                placeholder="John Doe"
            />
            <Input 
                label="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                required 
                placeholder="name@example.com"
            />
            <Input 
                label="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                required 
                placeholder="••••••••"
            />

            <div className="pt-2">
                <Button type="submit" fullWidth loading={loading} size="lg">
                    Sign Up
                </Button>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2"
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </motion.div>
            )}
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-all">
                Sign In
            </Link>
        </div>
      </motion.div>
      
      <div className="absolute bottom-6 text-xs text-gray-400">
         &copy; {new Date().getFullYear()} Agency OS. All rights reserved.
      </div>
    </div>
  )
}

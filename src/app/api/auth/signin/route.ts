import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    await login(email, password)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Login failed' }, { status: 400 })
  }
}

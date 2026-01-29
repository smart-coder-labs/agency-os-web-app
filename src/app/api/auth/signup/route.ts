import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json()
    await register(email, password, fullName)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sign up failed' }, { status: 400 })
  }
}

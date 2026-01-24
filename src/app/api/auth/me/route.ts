import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    // Don't return the password hash
    const { password_hash, ...safeUser } = user as any
    return NextResponse.json(safeUser)
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

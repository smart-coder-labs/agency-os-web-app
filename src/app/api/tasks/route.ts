import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const rows = await prisma.tasks.findMany({ orderBy: { created_at: 'desc' } })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const row = await prisma.tasks.create({ data })
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}

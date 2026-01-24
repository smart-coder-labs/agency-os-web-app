import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const rows = await prisma.projects.findMany({ orderBy: { created_at: 'desc' } })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const p = await prisma.projects.create({ data: body })
    return NextResponse.json(p)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}

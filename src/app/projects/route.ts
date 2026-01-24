import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, description, status } = await req.json()
    // @ts-ignore model from introspection
    const project = await prisma.projects.create({ data: { name, description, status } })
    return NextResponse.json({ id: project.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}

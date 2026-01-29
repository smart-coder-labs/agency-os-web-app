import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ project_id: string }> }) {
  const { project_id } = await params
  const row = await prisma.ui_specs.findUnique({ where: { project_id } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ project_id: string }> }) {
  try {
    const { project_id } = await params
    const data = await req.json()
    
    const exists = await prisma.ui_specs.findUnique({ where: { project_id } })
    const row = exists
      ? await prisma.ui_specs.update({ where: { project_id }, data })
      : await prisma.ui_specs.create({ data: { ...data, project_id } })
      
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}

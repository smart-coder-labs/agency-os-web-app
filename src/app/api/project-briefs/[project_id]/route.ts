import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { project_id: string } }) {
  const row = await prisma.project_briefs.findUnique({ where: { project_id: params.project_id } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PUT(req: NextRequest, { params }: { params: { project_id: string } }) {
  try {
    const data = await req.json()
    const exists = await prisma.project_briefs.findUnique({ where: { project_id: params.project_id } })
    const row = exists
      ? await prisma.project_briefs.update({ where: { project_id: params.project_id }, data })
      : await prisma.project_briefs.create({ data: { ...data, project_id: params.project_id } })
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { project_id: string } }) {
  try {
    await prisma.project_briefs.delete({ where: { project_id: params.project_id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}

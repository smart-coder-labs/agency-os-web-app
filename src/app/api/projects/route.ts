import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const rows = await prisma.projects.findMany({ orderBy: { created_at: 'desc' } })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, status, repo_path, github_path } = body
    
    const p = await prisma.projects.create({ 
      data: {
        name,
        description,
        status: status || 'DISCOVERY',
        repo_path,
        github_path
      } 
    })
    return NextResponse.json(p)
  } catch (e: any) {
    console.error('Error creating project:', e)
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 })
  }
}

import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/dal/projects.dal'

export async function GET() {
  try {
    const rows = await getProjects()
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}




import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function StoriesPage() {
  const rows = await prisma.user_stories.findMany({ orderBy: { created_at: 'desc' } }) as any
  return (
    <main style={{ padding: 24 }}>
      <h1>User Stories</h1>
      <Link href="/user-stories/new">New Story</Link>
      <ul>
        {rows.map((s:any) => (
          <li key={s.id}><Link href={`/user-stories/${s.id}`}>{s.title}</Link> - {s.status}</li>
        ))}
      </ul>
    </main>
  )
}

import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function StoryDetail({ params }: { params: { id: string } }) {
  const s = await prisma.user_stories.findUnique({ where: { id: params.id } }) as any
  if (!s) return <main style={{ padding: 24 }}>Not found</main>
  return (
    <main style={{ padding: 24 }}>
      <h1>{s.title}</h1>
      <p>Role: {s.role}</p>
      <p>Status: {s.status}</p>
      <Link href={`/user-stories/${s.id}/edit`}>Edit</Link>
    </main>
  )
}

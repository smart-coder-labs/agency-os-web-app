import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function TaskDetail({ params }: { params: { id: string } }) {
  const t = await prisma.tasks.findUnique({ where: { id: params.id } }) as any
  if (!t) return <main style={{ padding: 24 }}>Not found</main>
  return (
    <main style={{ padding: 24 }}>
      <h1>{t.title}</h1>
      <p>{t.description}</p>
      <p>Status: {t.status} | Type: {t.type} | Priority: {t.priority}</p>
      <Link href={`/tasks/${t.id}/edit`}>Edit</Link>
    </main>
  )
}

import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function TasksPage() {
  const rows = await prisma.tasks.findMany({ orderBy: { created_at: 'desc' } }) as any
  return (
    <main style={{ padding: 24 }}>
      <h1>Tasks</h1>
      <Link href="/tasks/new">New Task</Link>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th align="left">Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Project</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t:any) => (
            <tr key={t.id}>
              <td><Link href={`/tasks/${t.id}`}>{t.title}</Link></td>
              <td>{t.type}</td>
              <td>{t.status}</td>
              <td>{t.priority}</td>
              <td>{t.project_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

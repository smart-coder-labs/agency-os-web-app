import { prisma } from '@/lib/db'
import Link from 'next/link'

interface Params { params: { id: string } }

export default async function ProjectDetail({ params }: Params) {
  const id = params.id
  const project = await prisma.projects.findUnique({ where: { id } }) as any
  if (!project) return <main style={{ padding: 24 }}>Not found</main>
  const tasks = await prisma.tasks.findMany({ where: { project_id: id }, orderBy: { created_at: 'desc' } }) as any
  const stories = await prisma.user_stories.findMany({ where: { project_id: id }, orderBy: { created_at: 'desc' } }) as any
  return (
    <main style={{ padding: 24 }}>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <p>Status: {project.status}</p>
      <p>
        <Link href={`/projects/${id}/edit`}>Edit</Link> ·
        <Link href={`/projects/${id}/brief`}>Brief</Link> ·
        <Link href={`/projects/${id}/ui-specs`}>UI Specs</Link>
      </p>
      <section>
        <h2>Tasks</h2>
        <Link href={`/projects/${id}/tasks/new`}>New Task</Link>
        <ul>
          {tasks.map((t:any) => (
            <li key={t.id}>{t.title} - {t.status}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>User Stories</h2>
        <Link href={`/projects/${id}/stories/new`}>New Story</Link>
        <ul>
          {stories.map((s:any) => (
            <li key={s.id}>{s.title} - {s.status}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}

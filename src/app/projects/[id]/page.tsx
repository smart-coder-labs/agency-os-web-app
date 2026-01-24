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
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{project.name}</h1>
      <p className="text-gray-700">{project.description}</p>
      <p className="text-sm text-gray-600">Status: {project.status}</p>
      <div className="flex gap-3 text-sm">
        <Link className="text-blue-600" href={`/projects/${id}/edit`}>Edit</Link>
        <Link className="text-blue-600" href={`/projects/${id}/brief`}>Brief</Link>
        <Link className="text-blue-600" href={`/projects/${id}/ui-specs`}>UI Specs</Link>
      </div>
      <section>
        <h2 className="text-xl font-semibold mt-6">Tasks</h2>
        <Link className="text-blue-600" href={`/projects/${id}/tasks/new`}>New Task</Link>
        <ul>
          {tasks.map((t:any) => (
            <li key={t.id}>{t.title} - {t.status}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mt-6">User Stories</h2>
        <Link className="text-blue-600" href={`/projects/${id}/stories/new`}>New Story</Link>
        <ul>
          {stories.map((s:any) => (
            <li key={s.id}>{s.title} - {s.status}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

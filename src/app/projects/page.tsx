import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function ProjectsPage() {
  const projects = await prisma.projects.findMany({ orderBy: { created_at: 'desc' } }) as any
  return (
    <main style={{ padding: 24 }}>
      <h1>Projects</h1>
      <Link href="/projects/new">New Project</Link>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p:any) => (
            <tr key={p.id}>
              <td><Link href={`/projects/${p.id}`}>{p.name}</Link></td>
              <td>{p.description}</td>
              <td>{p.status}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

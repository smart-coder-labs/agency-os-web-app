import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function ProjectsPage() {
  const projects = await prisma.projects.findMany({ orderBy: { created_at: 'desc' } }) as any
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700" href="/projects/new">New Project</Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p:any) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 text-blue-600"><Link href={`/projects/${p.id}`}>{p.name}</Link></td>
                <td className="px-4 py-2 text-gray-700">{p.description}</td>
                <td className="px-4 py-2 text-center">{p.status}</td>
                <td className="px-4 py-2 text-center">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

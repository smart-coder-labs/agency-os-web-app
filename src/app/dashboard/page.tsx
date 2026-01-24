import { prisma } from '@/lib/db'
import Link from 'next/link'

async function getCounts() {
  const [users, projects, tasks] = await Promise.all([
    prisma.users.count() as any,
    prisma.projects.count() as any,
    prisma.tasks.count() as any,
  ])
  return { users, projects, tasks }
}

export default async function DashboardPage() {
  const { users, projects, tasks } = await getCounts()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Users</div>
          <div className="text-3xl font-semibold">{users}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Projects</div>
          <div className="text-3xl font-semibold">{projects}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Tasks</div>
          <div className="text-3xl font-semibold">{tasks}</div>
        </div>
      </div>
      <nav className="flex gap-3 text-sm">
        <Link className="text-blue-600" href="/users">Users</Link>
        <Link className="text-blue-600" href="/projects">Projects</Link>
        <Link className="text-blue-600" href="/tasks">Tasks</Link>
      </nav>
    </div>
  )
}

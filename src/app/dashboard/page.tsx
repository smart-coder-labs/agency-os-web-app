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
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-600">Overview rápido de tu sistema.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Users" value={users} />
        <StatCard label="Projects" value={projects} />
        <StatCard label="Tasks" value={tasks} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickLinks />
        <ActivityEmpty />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  )
}

function QuickLinks() {
  const items = [
    { href: '/projects/new', label: 'Create Project' },
    { href: '/tasks/new', label: 'Create Task' },
    { href: '/user-stories/new', label: 'Create Story' },
  ]
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
      <div className="font-medium mb-2">Quick Actions</div>
      <ul className="space-y-2 text-blue-600 text-sm">
        {items.map(i => (
          <li key={i.href}><Link href={i.href}>{i.label}</Link></li>
        ))}
      </ul>
    </div>
  )
}

function ActivityEmpty() {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
      <div className="font-medium mb-2">Recent Activity</div>
      <p className="text-sm text-gray-600">Todavía no hay actividad. Empezá creando un proyecto.</p>
    </div>
  )
}

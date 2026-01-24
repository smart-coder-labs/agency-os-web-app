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
    <main style={{ padding: 24, display: 'grid', gap: 16 }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        <div>Users: {users}</div>
        <div>Projects: {projects}</div>
        <div>Tasks: {tasks}</div>
      </div>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href="/users">Users</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/tasks">Tasks</Link>
      </nav>
    </main>
  )
}

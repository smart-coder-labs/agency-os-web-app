import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Counters } from '@/components/ui/Counters'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ActivityFeed } from '@/components/ui/ActivityFeed'
import { Button } from '@/components/ui/Button'

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

  const stats = [
    { label: 'Users', value: users, subtitle: 'Total users' },
    { label: 'Projects', value: projects, subtitle: 'Active projects' },
    { label: 'Tasks', value: tasks, subtitle: 'Pending tasks' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader 
        title="Dashboard" 
        description="Overview rápido de tu sistema."
      />

      <Counters items={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickLinks />
        <RecentActivity />
      </div>
    </div>
  )
}

function QuickLinks() {
  const items = [
    { href: '/projects/new', label: 'Create Project', desc: 'Start a new project workflow' },
    { href: '/tasks/new', label: 'Create Task', desc: 'Add a new task to queue' },
    { href: '/user-stories/new', label: 'Create Story', desc: 'Define user requirements' },
  ]
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {items.map(i => (
            <Link key={i.href} href={i.href} className="block group">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">{i.label}</div>
                  <div className="text-xs text-gray-500">{i.desc}</div>
                </div>
                <div className="text-gray-400 group-hover:text-blue-600">→</div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  // Mock activity for now
  const activities = [
    {
      id: "1",
      user: { name: "System", avatar: "" },
      action: "System started",
      target: "Agency OS",
      timestamp: new Date().toISOString()
    }
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system events</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ActivityFeed items={activities as any} />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <div className="text-sm text-gray-500 font-medium">No activity yet</div>
             <p className="text-xs text-gray-400 mt-1">Start by creating a project</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

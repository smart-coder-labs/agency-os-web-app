import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { ActivityFeed, ActivityItemProps, ActivityType } from '@/shared/components/ui/ActivityFeed'
import { Users, Briefcase, ClipboardList } from 'lucide-react'
import { StatisticDisplay } from '@/shared/components/ui/StatisticDisplay'
import { getProjectsCount } from '@/lib/dal/projects.dal'
import { getUsersCount } from '@/lib/dal/users.dal'
import { getTasksCount } from '@/lib/dal/tasks.dal'
import { getRecentActivity } from '@/lib/dal/execution_logs.dal'
import { JsonViewer } from '@/shared/components/ui/JsonViewer'
import jsonObject from '../../../../object.json'

type RecentActivityItem = Awaited<ReturnType<typeof getRecentActivity>>[number]

function mapLogToActivity(log: RecentActivityItem): ActivityItemProps {
  const actorName = log.agents ? log.agents.name : 'System'
  const actorInitials = actorName.slice(0, 2).toUpperCase()
  let type: ActivityType = 'default'
  if (log.log_type === 'ERROR') type = 'alert'
  if (log.log_type === 'SUCCESS') type = 'success'

  return {
    actor: { name: actorName, initials: actorInitials },
    action: <span>{log.title || 'performed an action'}</span>,
    date: log.created_at ? new Date(log.created_at).toLocaleString() : '',
    type,
    children: log.projects ? (
      <Link href={`/projects/${log.projects.id}`} className="text-xs text-blue-600 hover:underline">
        {log.projects.name}
      </Link>
    ) : null,
  }
}

async function getCounts() {
  const [userCount, projectCount, taskCount] = await Promise.all([
    getUsersCount(),
    getProjectsCount(),
    getTasksCount(),
  ])
  return { userCount, projectCount, taskCount }
}

export default async function DashboardPage() {
  const [{ userCount, projectCount, taskCount }, recentLogs] = await Promise.all([
    getCounts(),
    getRecentActivity(10),
  ])

  const activityItems = recentLogs.map(mapLogToActivity)

  const metrics = [
    {
        id: 'users',
        label: 'Total Users',
        value: userCount,
        change: '+12%',
        trend: 'up' as const,
        icon: <Users className="w-5 h-5" />,
        footer: <Link href="/users" className="text-xs text-blue-600 hover:underline">View all →</Link>,
    },
    {
        id: 'projects',
        label: 'Active Projects',
        value: projectCount,
        description: 'Ongoing work',
        icon: <Briefcase className="w-5 h-5" />,
        sparkline: [30, 45, 38, 52, 48, 60],
        sparklineAccent: 'purple' as const,
        footer: <Link href="/projects" className="text-xs text-blue-600 hover:underline">View all →</Link>,
    },
    {
        id: 'tasks',
        label: 'Pending Tasks',
        value: taskCount,
        change: 'High Priority',
        trend: 'neutral' as const,
        icon: <ClipboardList className="w-5 h-5" />,
        footer: <Link href="/tasks" className="text-xs text-blue-600 hover:underline">View all →</Link>,
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="Dashboard"
        description="System overview at a glance."
      />

      <StatisticDisplay
        metrics={metrics}
        variant="card"
        columns={3}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickLinks />
        <RecentActivity items={activityItems} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deep Object Inspector</CardTitle>
          <CardDescription>Explore data structure in deep_object.json (async load for 1GB+ files)</CardDescription>
        </CardHeader>
        <CardContent>
          <JsonViewer srcUrl="/api/large-data" maxHeight={600} initiallyExpanded={false} />
          <JsonViewer data={jsonObject} maxHeight={600} initiallyExpanded={false} />
        </CardContent>
      </Card>
    </div>
  )
}

import { AIPlanningWorkflow } from '@/shared/components/AIPlanningWorkflow'

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
          {/* CTA — Start a new project */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
            <h3 className="font-semibold text-base mb-1">Start a new project</h3>
            <p className="text-blue-100 text-sm mb-4">Describe your idea and let the AI agents plan, design, and build it.</p>
            <Link href="/projects/new">
              <button className="bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                Create project →
              </button>
            </Link>
          </div>

          <AIPlanningWorkflow />

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

function RecentActivity({ items }: { items: ActivityItemProps[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system events</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ActivityFeed items={items} />
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

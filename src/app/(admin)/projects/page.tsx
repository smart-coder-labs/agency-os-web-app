import { getProjects } from '@/lib/dal/projects.dal'
import { ProjectsTable } from './_components/ProjectsTable'
import { Briefcase, Clock, CheckCircle, FolderOpen } from 'lucide-react'
import { StatisticDisplay } from '@/shared/components/ui/StatisticDisplay'
import { ProjectsPageHeader } from './_components/ProjectsPageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'

export default async function ProjectsPage() {
  const projects = await getProjects()

  // Calculate metrics
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'DISCOVERY').length
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length

  const metrics = [
    {
        id: 'total-projects',
        label: 'Total Projects',
        value: totalProjects,
        icon: <Briefcase className="w-5 h-5" />,
        sparkline: [20, 25, 22, 28, 30, 32, 35],
    },
    {
        id: 'in-discovery',
        label: 'In Discovery',
        value: activeProjects,
        change: 'Active phase',
        trend: 'neutral' as const,
        icon: <Clock className="w-5 h-5" />,
        sparkline: [10, 15, 12, 18, 15, 20, 18],
        sparklineAccent: 'purple' as const,
    },
    {
        id: 'completed',
        label: 'Completed',
        value: completedProjects,
        change: '+2 this month',
        trend: 'up' as const,
        icon: <CheckCircle className="w-5 h-5" />,
        sparkline: [2, 3, 3, 4, 5, 5, 7],
        sparklineAccent: 'green' as const,
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ProjectsPageHeader />
      
      <StatisticDisplay 
        metrics={metrics}
        columns={3}
      />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Start by creating your first project. The AI agents will take it from brief to code."
            action={{ label: 'Create project', href: '/projects/new' }}
          />
        ) : (
          <ProjectsTable data={projects as any[]} />
        )}
      </div>
    </div>
  )
}

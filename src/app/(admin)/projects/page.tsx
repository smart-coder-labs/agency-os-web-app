import { prisma } from '@/lib/db'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import Link from 'next/link'
import { Plus, Briefcase, Clock, CheckCircle } from 'lucide-react'
import { StatisticDisplay } from '@/components/ui/StatisticDisplay'

export default async function ProjectsPage() {
  const projects = await prisma.projects.findMany({ 
    orderBy: { created_at: 'desc' }
  })

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
      <SectionHeader 
        title="Projects" 
        description="Manage your ongoing projects and workflows."
        actions={
          <Link href="/projects/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Project
            </Button>
          </Link>
        }
      />
      
      <StatisticDisplay 
        metrics={metrics}
        columns={3}
      />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <ProjectsTable data={projects as any[]} />
      </div>
    </div>
  )
}

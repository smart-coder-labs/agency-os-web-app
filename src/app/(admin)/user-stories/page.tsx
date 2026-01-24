import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { StoriesTable } from '@/components/stories/StoriesTable'
import { Plus, BookOpen, MessageSquare, CheckSquare } from 'lucide-react'
import { StatisticDisplay } from '@/components/ui/StatisticDisplay'

export default async function StoriesPage() {
  const rows = await prisma.user_stories.findMany({ 
    orderBy: { created_at: 'desc' },
    include: {
      projects: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  // Map data to match StoriesTable expected format
  const formattedStories = rows.map((story: any) => ({
    ...story,
    project: story.projects, // Map plural DB relation to singular component prop
  }))

  // Calculate metrics
  const totalStories = rows.length
  const pendingStories = rows.filter(s => s.status === 'PENDING').length
  const completedStories = rows.filter(s => s.status === 'COMPLETED').length

  const metrics = [
    {
        id: 'total-stories',
        label: 'Total Stories',
        value: totalStories,
        icon: <BookOpen className="w-5 h-5" />,
        sparkline: [45, 50, 48, 55, 60, 62, 65],
    },
    {
        id: 'pending-stories',
        label: 'Pending',
        value: pendingStories,
        change: 'Awaiting dev',
        trend: 'neutral' as const,
        icon: <MessageSquare className="w-5 h-5" />,
        sparkline: [20, 25, 22, 28, 26, 30, 28],
        sparklineAccent: 'purple' as const,
    },
    {
        id: 'completed-stories',
        label: 'Approved',
        value: completedStories,
        change: 'Ready for build',
        trend: 'up' as const,
        icon: <CheckSquare className="w-5 h-5" />,
        sparkline: [10, 15, 18, 20, 25, 28, 30],
        sparklineAccent: 'green' as const,
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader 
        title="User Stories" 
        description="Define and prioritize user requirements and features."
        actions={
          <Link href="/user-stories/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Story
            </Button>
          </Link>
        }
      />

      <StatisticDisplay 
        metrics={metrics}
        columns={3}
      />
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <StoriesTable data={formattedStories} />
      </div>
    </div>
  )
}

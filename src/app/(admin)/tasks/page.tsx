import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { TasksTable } from '@/components/tasks/TasksTable'
import { Plus } from 'lucide-react'

function mapPriority(p: number): string {
  if (p >= 4) return 'URGENT'
  if (p === 3) return 'HIGH'
  if (p === 2) return 'MEDIUM'
  return 'LOW'
}

export default async function TasksPage() {
  const rows = await prisma.tasks.findMany({ 
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

  // Map data to match TasksTable expected format
  const formattedTasks = rows.map((task: any) => ({
    ...task,
    project: task.projects, // Map plural DB relation to singular component prop
    priority: mapPriority(task.priority) // Convert numeric priority to label
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader 
        title="Tasks" 
        description="Track and manage individual tasks across all projects."
        actions={
          <Link href="/tasks/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Task
            </Button>
          </Link>
        }
      />
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <TasksTable data={formattedTasks} />
      </div>
    </div>
  )
}

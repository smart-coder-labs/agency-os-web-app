import Link from 'next/link'
import { getTasks } from '@/lib/dal/tasks.dal';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { Button } from '@/shared/components/ui/Button';
import { TasksTable } from '@/shared/components/TasksTable';
import { Plus, ListChecks, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StatisticDisplay } from '@/shared/components/ui/StatisticDisplay';

function mapPriority(p: number | null): string {
  if (p === null || p === undefined) return 'LOW';
  if (p >= 4) return 'URGENT';
  if (p === 3) return 'HIGH';
  if (p === 2) return 'MEDIUM';
  return 'LOW';
}

export default async function TasksPage() {
  const rows = await getTasks();

  // Map data to match TasksTable expected format
  const formattedTasks = rows.map((task: any) => ({
    ...task,
    project: task.projects, // Map plural DB relation to singular component prop
    priority: mapPriority(task.priority) // Convert numeric priority to label
  }))

  // Calculate metrics
  const totalTasks = rows.length
  const pendingTasks = rows.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS').length
  const highPriorityTasks = rows.filter(t => (t.priority || 0) >= 3).length

  const metrics = [
    {
        id: 'total-tasks',
        label: 'Total Tasks',
        value: totalTasks,
        icon: <ListChecks className="w-5 h-5" />,
        sparkline: [100, 110, 115, 120, 122, 125, 130],
    },
    {
        id: 'pending-tasks',
        label: 'Pending',
        value: pendingTasks,
        change: 'In queue',
        trend: 'neutral' as const,
        icon: <AlertCircle className="w-5 h-5" />,
        sparkline: [40, 45, 42, 48, 50, 48, 52],
        sparklineAccent: 'orange' as const,
    },
    {
        id: 'completed-tasks',
        label: 'High Priority',
        value: highPriorityTasks,
        change: 'Requires attention',
        trend: 'up' as const,
        icon: <CheckCircle2 className="w-5 h-5" />,
        sparkline: [5, 8, 12, 10, 15, 18, 20],
        sparklineAccent: 'pink' as const,
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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

      <StatisticDisplay 
        metrics={metrics}
        columns={3}
      />
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <TasksTable data={formattedTasks} />
      </div>
    </div>
  )
}

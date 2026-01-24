import { prisma } from '@/lib/db'
import Link from 'next/link'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Markdown } from '@/components/ui/Markdown'
import { ArrowLeft, Edit, Clock, GitCommit, PlayCircle, FileJson, Terminal } from 'lucide-react'

function mapPriority(p: number): string {
  if (p >= 4) return 'URGENT'
  if (p === 3) return 'HIGH'
  if (p === 2) return 'MEDIUM'
  return 'LOW'
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
    TODO: 'default',
    IN_PROGRESS: 'primary',
    REVIEW: 'info',
    DONE: 'success',
    BLOCKED: 'error',
  }
  return <Badge variant={map[status] || 'default'}>{status}</Badge>
}

export default async function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const task = await prisma.tasks.findUnique({
    where: { id },
    include: {
        projects: {
            select: { name: true, id: true }
        }
    }
  }) as any

  if (!task) return <div className="p-8">Task not found</div>

  const priorityLabel = mapPriority(task.priority)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link href="/tasks" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks
      </Link>

      {/* Header */}
      <SectionHeader 
        title={
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-3">
                <span className="text-gray-400 font-normal text-lg">#{task.id.slice(0,8)}</span>
                {task.title}
             </div>
             <div className="flex gap-2">
                <StatusBadge status={task.status} />
                <Badge variant={priorityLabel === 'URGENT' ? 'error' : 'default'} size="sm">
                   {priorityLabel} Priority
                </Badge>
                <Badge variant="default" size="sm" className="font-mono">
                   {task.type}
                </Badge>
             </div>
          </div>
        }
        actions={
          <Link href={`/tasks/${id}/edit`}>
            <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
              Edit Task
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="context">Input Context</TabsTrigger>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Markdown>{task.description}</Markdown>
                    </CardContent>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-xs text-gray-400 block mb-1">Project</span>
                                {task.projects ? (
                                    <Link href={`/projects/${task.projects.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                        {task.projects.name}
                                    </Link>
                                ) : <span className="text-gray-500 text-sm">No Project</span>}
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block mb-1">Created At</span>
                                <span className="text-sm text-gray-700 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {new Date(task.created_at).toLocaleDateString()}
                                </span>
                            </div>
                             {task.completed_at && (
                                <div>
                                    <span className="text-xs text-gray-400 block mb-1">Completed At</span>
                                    <span className="text-sm text-green-700 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(task.completed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {task.git_branches && task.git_branches.length > 0 && (
                        <Card>
                             <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                    <GitCommit className="w-4 h-4" /> Git Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {task.git_branches.map((branch: string, i: number) => (
                                        <div key={i} className="text-xs font-mono bg-gray-50 p-1.5 rounded text-gray-600 truncate">
                                            {branch}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </TabsContent>

        <TabsContent value="context">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-purple-500" /> Input Context
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs font-mono max-h-[600px]">
                        {JSON.stringify(task.input_context, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="logs">
             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-gray-700" /> Execution Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {task.execution_log ? (
                        <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-gray-50 font-mono text-sm">
                            <Markdown>{task.execution_log}</Markdown>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-12 text-gray-400 italic">
                            No execution logs available.
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScrollArea({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={`overflow-auto ${className}`}>{children}</div>
}

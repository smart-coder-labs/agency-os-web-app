import Link from 'next/link';
import { getTaskById } from '@/lib/dal/tasks.dal';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs';
import { Markdown } from '@/shared/components/ui/Markdown';
import { ActivityFeed, ActivityItemProps, ActivityType } from '@/shared/components/ui/ActivityFeed';
import { ArrowLeft, Edit, Clock, GitCommit, FileJson, Activity, Layers, LayoutDashboard } from 'lucide-react';
import { UIArtifactsGrid } from '@/shared/components/artifacts/UIArtifactsGrid';


function mapPriority(p: number | null): string {
  if (p === null || p === undefined) return 'LOW';
  if (p >= 4) return 'URGENT';
  if (p === 3) return 'HIGH';
  if (p === 2) return 'MEDIUM';
  return 'LOW';
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
    TODO: 'default',
    IN_PROGRESS: 'primary',
    REVIEW: 'info',
    DONE: 'success',
    BLOCKED: 'error',
  };
  return <Badge variant={map[status || 'TODO'] || 'default'}>{status || 'TODO'}</Badge>;
}

function mapLogToActivity(log: any): ActivityItemProps {
  const actorName = log.agents ? log.agents.name : (log.tools ? `Tool: ${log.tools.name}` : 'System');
  const actorInitials = actorName.slice(0, 2).toUpperCase();
  
  let type: ActivityType = 'default';
  if (log.log_type === 'ERROR') type = 'alert';
  if (log.log_type === 'SUCCESS') type = 'success';
  if (log.tools) type = 'commit';

  return {
    actor: { name: actorName, initials: actorInitials },
    action: <span>{log.title || 'performed an action'}</span>,
    date: new Date(log.created_at).toLocaleString(),
    type: type,
    children: log.detail ? <Markdown className="text-sm">{log.detail}</Markdown> : null
  };
}

interface TaskDetailProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetail({ params }: TaskDetailProps) {
  const { id } = await params;
  
  const task = await getTaskById(id);

  if (!task) return <div className="p-8">Task not found</div>;

  const priorityLabel = mapPriority(task.priority);
  const activityItems = task.execution_logs ? task.execution_logs.map(mapLogToActivity) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <Link href="/tasks" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks
      </Link>

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
            <TabsTrigger value="overview">
                <LayoutDashboard className="w-4 h-4 opacity-70" />
                Overview
            </TabsTrigger>
            <TabsTrigger value="artifacts">
                <Layers className="w-4 h-4 opacity-70" />
                UI Artifacts
                <Badge variant="default" size="sm" className="ml-2 px-1.5 h-5 min-w-[20px]">
                    {Array.isArray(task.output_artifacts) ? task.output_artifacts.filter((a: any) => a.type === 'ui' || a.screenshot_url || a.html_url).length : 0}
                </Badge>
            </TabsTrigger>
            <TabsTrigger value="context">
                <FileJson className="w-4 h-4 opacity-70" />
                Input Context
            </TabsTrigger>
            <TabsTrigger value="logs">
                <Activity className="w-4 h-4 opacity-70" />
                Execution Logs
            </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Markdown>{task.description}</Markdown>
                    </CardContent>
                </Card>

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
                                    {task.created_at && new Date(task.created_at).toLocaleDateString()}
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

        <TabsContent value="artifacts">
            <UIArtifactsGrid 
                artifacts={Array.isArray(task.output_artifacts) ? task.output_artifacts.map((a: any, i: number) => ({
                    id: a.id || `artifact-${i}`,
                    title: a.title || a.name || 'Task Artifact',
                    screenshot_url: a.screenshot_url,
                    html_url: a.html_url,
                    device_type: a.device_type,
                    width: a.width,
                    height: a.height,
                    created_at: a.created_at || (task.created_at || new Date())
                })).filter((a: any) => a.screenshot_url || a.html_url) : []} 
                emptyMessage="No UI artifacts were generated by this task."
            />
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
                        <Activity className="w-4 h-4 text-gray-700" /> Activity Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activityItems.length > 0 ? (
                        <ActivityFeed items={activityItems} />
                    ) : (
                        <div className="text-center py-12 text-gray-400 italic">
                            No logs yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

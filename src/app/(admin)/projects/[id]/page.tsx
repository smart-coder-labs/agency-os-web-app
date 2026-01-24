import { prisma } from '@/lib/db'
import Link from 'next/link'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TasksTable } from '@/components/tasks/TasksTable'
import { StoriesTable } from '@/components/stories/StoriesTable'
import { ActivityFeed, ActivityItemProps, ActivityType } from '@/components/ui/ActivityFeed'
import { Edit, FileText, LayoutTemplate, Plus, ExternalLink, GitBranch, Github, Activity } from 'lucide-react'

interface Params { params: Promise<{ id: string }> }

function mapPriority(p: number): string {
  if (p >= 4) return 'URGENT'
  if (p === 3) return 'HIGH'
  if (p === 2) return 'MEDIUM'
  return 'LOW'
}

function mapLogToActivity(log: any): ActivityItemProps {
  const actorName = log.agents ? log.agents.name : (log.tools ? `Tool: ${log.tools.name}` : 'System')
  const actorInitials = actorName.slice(0, 2).toUpperCase()
  
  let type: ActivityType = 'default'
  if (log.log_type === 'ERROR') type = 'alert'
  if (log.log_type === 'SUCCESS') type = 'success'
  if (log.tools) type = 'commit' // treating tool execution as 'commit' style for now or generic

  return {
    actor: {
      name: actorName,
      initials: actorInitials
    },
    action: <span>{log.title || 'performed an action'}</span>,
    date: new Date(log.created_at).toLocaleString(),
    type: type,
    children: <p>{log.detail}</p>
  }
}

export default async function ProjectDetail({ params }: Params) {
  const { id } = await params
  
  const [project, tasks, stories, logs] = await Promise.all([
    prisma.projects.findUnique({ 
      where: { id },
      include: {
        architecture_specs: true,
        project_briefs: true,
        ui_specs: true
      }
    }),
    prisma.tasks.findMany({ 
      where: { project_id: id }, 
      orderBy: { created_at: 'desc' } 
    }),
    prisma.user_stories.findMany({ 
      where: { project_id: id }, 
      orderBy: { created_at: 'desc' } 
    }),
    prisma.execution_logs.findMany({
      where: { project_id: id },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        agents: true,
        tools: true
      }
    })
  ]) as any[]

  if (!project) return <div className="p-8">Project not found</div>

  // Data mapping for tables
  const formattedTasks = tasks.map((t: any) => ({
    ...t,
    project: { id: project.id, name: project.name },
    priority: mapPriority(t.priority)
  }))

  const formattedStories = stories.map((s: any) => ({
    ...s,
    project: { id: project.id, name: project.name }
  }))

  const activityItems = logs.map(mapLogToActivity)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <SectionHeader 
        title={
          <div className="flex items-center gap-3">
             {project.name}
             <Badge variant={project.status === 'COMPLETED' ? 'success' : 'primary'} size="sm">
               {project.status}
             </Badge>
          </div>
        }
        description={project.description || 'No description provided.'}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/projects/${id}/edit`}>
              <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
                Edit
              </Button>
            </Link>
            <Link href={`/tasks/new?projectId=${id}`}>
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Add Task
              </Button>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks 
            <Badge variant="default" size="sm" className="ml-2 px-1.5 h-5 min-w-[20px]">{tasks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="stories">
             Stories
             <Badge variant="default" size="sm" className="ml-2 px-1.5 h-5 min-w-[20px]">{stories.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Overview Content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Repo Info */}
             <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-blue-500" />
                    Repository
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.repo_path ? (
                    <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Local Path</span>
                        <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-100 break-all mt-1">
                        {project.repo_path}
                        </div>
                    </div>
                  ) : null}
                  
                  {project.github_path ? (
                    <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                             <Github className="w-3 h-3" /> GitHub
                        </span>
                        <a href={project.github_path} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-blue-600 hover:underline block mt-1 truncate">
                            {project.github_path}
                        </a>
                    </div>
                  ) : (
                    !project.repo_path && <span className="text-sm text-gray-400">No repository linked</span>
                  )}
                </CardContent>
             </Card>

             {/* Brief */}
             <Card className="hover:border-blue-200 transition-colors group cursor-pointer">
                <Link href={`/projects/${id}/brief`} className="block h-full"> 
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 group-hover:text-blue-600">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Project Brief
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {project.project_briefs ? 'View project goals and target audience.' : 'Not defined yet.'}
                    </p>
                  </CardContent>
                </Link>
             </Card>

             {/* Specs */}
             <Card className="hover:border-blue-200 transition-colors group cursor-pointer">
                <Link href={`/projects/${id}/ui-specs`} className="block h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 group-hover:text-blue-600">
                      <LayoutTemplate className="w-4 h-4 text-pink-500" />
                      UI Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {project.ui_specs ? 'View design system and components.' : 'Not defined yet.'}
                    </p>
                  </CardContent>
                </Link>
             </Card>
          </div>

          {/* Activity Logs */}
          <div className="space-y-4 mt-10">
            <h3 className="text-lg font-medium flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500" /> Recent Activity
            </h3>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                {activityItems.length > 0 ? (
                    <ActivityFeed items={activityItems} />
                ) : (
                    <div className="text-center py-8 text-gray-400">No recent activity</div>
                )}
            </div>
          </div>
        </TabsContent>

        {/* Tasks Content */}
        <TabsContent value="tasks">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
             <TasksTable data={formattedTasks} />
          </div>
        </TabsContent>

        {/* Stories Content */}
        <TabsContent value="stories">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
             <StoriesTable data={formattedStories} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

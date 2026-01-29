import Link from 'next/link'
import { Button } from '@/shared/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { TasksTable } from '@/shared/components/TasksTable'
import { StoriesTable } from '@/shared/components/StoriesTable'
import { UIArtifactsGrid } from '@/shared/components/artifacts/UIArtifactsGrid'
import { Markdown } from '@/shared/components/ui/Markdown'
import { ActivityFeed, ActivityItemProps, ActivityType } from '@/shared/components/ui/ActivityFeed'
import { Edit, FileText, LayoutTemplate, ExternalLink, GitBranch, Github, Activity, BookOpen, Layers, Cpu, FileCode, LayoutDashboard, CheckSquare, Code2, Users } from 'lucide-react'
import { AgentsTable } from '@/shared/components/AgentsTable'
import { StatisticDisplay } from '@/shared/components/ui/StatisticDisplay'
import { formatCompactNumber } from '@/lib/utils'
import { AgentFlow } from '@/shared/components/AgentFlow'
import { getProjectById } from '@/lib/dal/projects.dal'
import { getTasksByProjectId, countTasksByProjectId, countCompletedTasksByProjectId } from '@/lib/dal/tasks.dal'
import { getStoriesByProjectId } from '@/lib/dal/user_stories.dal'
import { getLogsByProjectId } from '@/lib/dal/execution_logs.dal'
import { getAgentsByProjectId, getCollaborationsByProjectId } from '@/lib/dal/agents.dal'
import { ProjectDetailPageHeader } from './_components/ProjectDetailPageHeader'


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

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetail({ params }: ProjectDetailPageProps) {
  const { id } = await params
  
  const [project, tasks, stories, logs, agents, tasksCount, completedTasksCount, collaborations] = await Promise.all([
    getProjectById(id),
    getTasksByProjectId(id),
    getStoriesByProjectId(id),
    getLogsByProjectId(id),
    getAgentsByProjectId(id),
    countTasksByProjectId(id),
    countCompletedTasksByProjectId(id),
    getCollaborationsByProjectId(id),
  ]) as any[]

  if (!project) return <div className="p-8">Project not found</div>

  const totalTasks = tasksCount || 0
  const completedTasks = completedTasksCount || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Aggregate Agent Metrics
  const projectAgents = agents || []
  const totalTokens = projectAgents.reduce((acc: number, agent: any) => 
    acc + (agent.agent_jobs?.reduce((sum: number, job: any) => sum + (job.total_tokens || 0), 0) || 0), 0
  )
  const totalJobs = projectAgents.reduce((acc: number, agent: any) => 
    acc + (agent.agent_jobs?.length || 0), 0
  )
  const avgMemory = projectAgents.length > 0 
    ? projectAgents.reduce((acc: number, agent: any) => acc + (agent.agent_metrics?.[0]?.memory_usage || 0), 0) / projectAgents.length 
    : 0

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <ProjectDetailPageHeader project={project} id={id} />

      {/* Analytics Section */}
      <StatisticDisplay 
        metrics={[
            {
                id: 'tokens-consumed',
                label: 'Tokens Consumed',
                value: formatCompactNumber(totalTokens),
                icon: <Activity className="w-5 h-5" />,
                sparkline: [30, 45, 35, 50, 40, 60, 55],
                sparklineAccent: 'blue',
            },
            {
                id: 'agent-jobs',
                label: 'Agent Jobs',
                value: totalJobs,
                icon: <Cpu className="w-5 h-5" />,
                sparkline: [10, 20, 15, 25, 22, 30, 28],
                sparklineAccent: 'purple',
            },
            {
                id: 'avg-memory',
                label: 'Avg Memory Usage',
                value: `${avgMemory.toFixed(1)} MB`,
                icon: <Layers className="w-5 h-5" />,
                sparkline: [40, 42, 38, 45, 43, 41, 39],
                sparklineAccent: 'orange',
            },
            {
                id: 'task-progress',
                label: 'Task Progress',
                value: `${completionRate}%`,
                change: `${completedTasks}/${totalTasks} tasks`,
                trend: completionRate > 50 ? 'up' : 'neutral',
                icon: <CheckSquare className="w-5 h-5" />,
                sparkline: [0, 10, 25, 40, 50, 65, 80],
                sparklineAccent: 'green',
            }
        ]}
        columns={4}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">
             <LayoutDashboard className="w-4 h-4 opacity-70" />
             Overview
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="w-4 h-4 opacity-70" />
            Tasks 
            <Badge variant="default" size="sm" className="ml-2 px-1.5 h-5 min-w-[20px]">{tasks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="stories">
             <BookOpen className="w-4 h-4 opacity-70" />
             Stories
             <Badge variant="default" size="sm" className="ml-2 px-1.5 h-5 min-w-[20px]">{stories.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="brief">
             <FileText className="w-4 h-4 opacity-70" />
             Brief
          </TabsTrigger>
          <TabsTrigger value="architecture">
             <Cpu className="w-4 h-4 opacity-70" />
             Architecture
          </TabsTrigger>
          <TabsTrigger value="ui-specs" className="flex items-center gap-2">
             <LayoutTemplate className="w-4 h-4 opacity-70" />
             UI Specs
          </TabsTrigger>
          <TabsTrigger value="artifacts" className="flex items-center gap-2">
             <Layers className="w-4 h-4 opacity-70" />
             UI Artifacts
             <Badge variant="default" size="sm" className="ml-2 px-1.5 h-5 min-w-[20px]">{project.project_artifacts?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
             <Users className="w-4 h-4 opacity-70" />
             Agents
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex items-center gap-2">
             <GitBranch className="w-4 h-4 opacity-70" />
             Agent Flow
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

        {/* Brief Content */}
        <TabsContent value="brief">
           <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                   <CardTitle className="text-lg">Project Brief</CardTitle>
                   <CardDescription>Goals and project strategy</CardDescription>
                </div>
                <Link href={`/brief/${project.id}/edit`}>
                   <Button variant="secondary" size="sm" leftIcon={<Edit className="w-3 h-3" />}>Edit Brief</Button>
                </Link>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                {project.project_briefs?.target_audience && (
                   <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <h4 className="text-purple-900 font-semibold mb-1 text-sm uppercase tracking-wider">Target Audience</h4>
                      <p className="text-purple-800">{project.project_briefs.target_audience}</p>
                   </div>
                )}
                {project.project_briefs?.content ? (
                   <Markdown>{project.project_briefs.content}</Markdown>
                ) : (
                   <div className="text-center py-12 text-gray-400 italic">No brief content defined yet.</div>
                )}
              </CardContent>
           </Card>
        </TabsContent>

        {/* Architecture Content */}
        <TabsContent value="architecture">
           <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                   <CardTitle className="text-lg">Architecture Specifications</CardTitle>
                   <CardDescription>Technical stack and system design</CardDescription>
                </div>
                <Link href={`/architecture/${id}/edit`}>
                   <Button variant="secondary" size="sm" leftIcon={<Edit className="w-3 h-3" />}>Edit Architecture</Button>
                </Link>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                {project.architecture_specs?.content || (project.architecture_specs?.diagrams as any[])?.length > 0 || Object.keys((project.architecture_specs?.stack_decisions as object) || {}).length > 0 ? (
                  <div className="space-y-10">
                    {project.architecture_specs?.content && <Markdown>{project.architecture_specs.content}</Markdown>}
                    
                    {/* Diagrams Section */}
                    {((project.architecture_specs?.diagrams as any[])?.length ?? 0) > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 not-prose">
                                <Cpu className="w-5 h-5 text-blue-500" /> Architecture Diagrams
                            </h3>
                            <div className="space-y-8">
                                {(project.architecture_specs?.diagrams as any[]).map((diag, i) => (
                                    <div key={i} className="space-y-4">
                                        {diag.name && <h4 className="font-semibold text-gray-700 not-prose">{diag.name}</h4>}
                                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 overflow-hidden not-prose">
                                            <Markdown>{` \`\`\`mermaid\n${diag.code || diag.content}\n\`\`\` `}</Markdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stack Decisions */}
                    {Object.keys((project.architecture_specs?.stack_decisions as object) || {}).length > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 not-prose">
                                <Code2 className="w-5 h-5 text-purple-500" /> Tech Stack Decisions
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 not-prose">
                                {Object.entries((project.architecture_specs?.stack_decisions as object)).map(([key, value]) => (
                                    <div key={key} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none block mb-1">{key}</span>
                                        <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                ) : (
                   <div className="text-center py-12 text-gray-400 italic">No architecture specifications defined yet.</div>
                )}
              </CardContent>
           </Card>
        </TabsContent>
         {/* UI Specs Content */}
         <TabsContent value="ui-specs">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 mb-6">
                 <div>
                    <CardTitle className="text-lg">UI Specifications</CardTitle>
                    <CardDescription>Design system and visual identity</CardDescription>
                 </div>
                 <Link href={`/ui-specs/${id}/edit`}>
                    <Button variant="secondary" size="sm" leftIcon={<Edit className="w-3 h-3" />}>Edit UI Specs</Button>
                 </Link>
               </CardHeader>
               <CardContent>
                  <div className="space-y-8">
                     {project.ui_specs?.wireframes_md && (
                        <div>
                           <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Wireframes</h4>
                           <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                              <Markdown>{project.ui_specs.wireframes_md}</Markdown>
                           </div>
                        </div>
                     )}
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.ui_specs?.design_system && (
                           <div>
                              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Design System Tokens</h4>
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[300px]">
                                 {JSON.stringify(project.ui_specs.design_system, null, 2)}
                              </pre>
                           </div>
                        )}
                        {project.ui_specs?.components && (
                           <div>
                              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Components</h4>
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[300px]">
                                 {JSON.stringify(project.ui_specs.components, null, 2)}
                              </pre>
                           </div>
                        )}
                     </div>

                     {!project.ui_specs && (
                        <div className="text-center py-12 text-gray-400 italic">No UI specifications defined yet.</div>
                     )}
                  </div>
               </CardContent>
            </Card>
         </TabsContent>
         <TabsContent value="artifacts">
            <UIArtifactsGrid artifacts={project.project_artifacts || []} />
         </TabsContent>

         {/* Agents Content */}
         <TabsContent value="agents">
            {agents.length > 0 ? (
               <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <AgentsTable data={agents} />
               </div>
            ) : (
               <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Users className="w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-1">No Agents Found</h3>
                 <p className="text-gray-500 max-w-xs mx-auto text-sm">No agents have been involved in this project yet. Start a task to assign an agent.</p>
               </div>
            )}
         </TabsContent>
          {/* Flow Content */}
          <TabsContent value="flow">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                   <Activity className="w-5 h-5 text-blue-500" />
                   Agent Communication Flow
                </CardTitle>
                <CardDescription>Visual representation of how agents are collaborating on this project.</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentFlow collaborations={collaborations} agents={agents} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

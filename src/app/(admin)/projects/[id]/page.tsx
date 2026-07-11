import Link from 'next/link'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { CopyButton } from '@/shared/components/ui/CopyButton'
import { TasksTable } from '@/shared/components/TasksTable'
import { StoriesTable } from '@/shared/components/StoriesTable'
import { UIArtifactsGrid } from '@/shared/components/artifacts/UIArtifactsGrid'
import { Markdown } from '@/shared/components/ui/Markdown'
import { ActivityFeed, ActivityItemProps, ActivityType } from '@/shared/components/ui/ActivityFeed'
import { Edit, FileText, LayoutTemplate, ExternalLink, GitBranch, Github, Activity, BookOpen, Layers, Cpu, FileCode, LayoutDashboard, CheckSquare, Code2, Users, Calendar, Bot } from 'lucide-react'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { AgentsTable } from '@/shared/components/AgentsTable'
import { StatisticDisplay } from '@/shared/components/ui/StatisticDisplay'
import { formatCompactNumber } from '@/lib/utils'
import { AgentFlow } from '@/shared/components/AgentFlow'
import { getProjectById } from '@/lib/dal/projects.dal'
import { getTasksByProjectId, countTasksByProjectId, countCompletedTasksByProjectId } from '@/lib/dal/tasks.dal'
import { getStoriesByProjectId } from '@/lib/dal/user_stories.dal'
import { getLogsByProjectId } from '@/lib/dal/execution_logs.dal'
import { getAgentsByProjectId, getCollaborationsByProjectId } from '@/lib/dal/agents.dal'
import type { FormattedTask, FormattedStory } from '@/shared/types/db'
import { ProjectDetailPageHeader } from './_components/ProjectDetailPageHeader'
import { ProjectWorkflowPanel } from './_components/ProjectWorkflowPanel'
import { Breadcrumb } from '@/shared/components/ui/Breadcrumb'


function mapPriority(p: number): string {
  if (p >= 4) return 'URGENT'
  if (p === 3) return 'HIGH'
  if (p === 2) return 'MEDIUM'
  return 'LOW'
}

type ExecutionLogWithRelations = Awaited<ReturnType<typeof getLogsByProjectId>>[number];

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

function cleanTitle(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback
  // strip leading "AgentRole_UUID" prefix e.g. "Doc_54437a47-..."
  const stripped = raw.replace(/^[A-Za-z]+_[0-9a-f-]{36}\s*/i, '').trim()
  // if what's left is still just a UUID, discard it
  if (UUID_RE.test(stripped) && stripped.length < 40) return fallback
  return stripped || fallback
}

function mapLogToActivity(log: ExecutionLogWithRelations): ActivityItemProps {
  const agentName = log.agents?.name
  const toolName = log.tools?.name
  const actorName = agentName ?? (toolName ? toolName : 'System')
  const actorInitials = actorName.slice(0, 2).toUpperCase()

  let type: ActivityType = 'default'
  if (log.log_type === 'ERROR') type = 'alert'
  else if (log.log_type === 'SUCCESS') type = 'success'
  else if (log.tools) type = 'commit'

  const actionLabel = cleanTitle(
    log.title,
    toolName ? `executed ${toolName}` : log.log_type?.toLowerCase() ?? 'performed an action'
  )

  return {
    actor: { name: actorName, initials: actorInitials },
    action: <span>{actionLabel}</span>,
    date: log.created_at ? new Date(log.created_at).toLocaleString() : '',
    type,
    children: log.detail ? <p className="text-xs text-gray-500 mt-0.5">{log.detail}</p> : undefined,
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
  ])

  if (!project) return <div className="p-8">Project not found</div>

  const totalTasks = tasksCount || 0
  const completedTasks = completedTasksCount || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  type AgentResult = Awaited<ReturnType<typeof getAgentsByProjectId>>[number];

  // Aggregate Agent Metrics
  const projectAgents = agents || []
  const totalTokens = projectAgents.reduce((acc: number, agent: AgentResult) =>
    acc + (agent.agent_jobs?.reduce((sum: number, job) => sum + (job.total_tokens || 0), 0) || 0), 0
  )
  const totalJobs = projectAgents.reduce((acc: number, agent: AgentResult) =>
    acc + (agent.agent_jobs?.length || 0), 0
  )
  const avgMemory = projectAgents.length > 0
    ? projectAgents.reduce((acc: number, agent: AgentResult) => acc + (agent.agent_metrics?.[0]?.memory_usage || 0), 0) / projectAgents.length
    : 0

  // Data mapping for tables
  const formattedTasks: FormattedTask[] = tasks.map((t) => ({
    ...t,
    project: { id: project.id, name: project.name },
    priority: mapPriority(t.priority ?? 1),
  }))

  const formattedStories: FormattedStory[] = stories.map((s) => ({
    ...s,
    project: { id: project.id, name: project.name },
  }))

  const activityItems = logs.map(mapLogToActivity)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Breadcrumb items={[
        { label: 'Projects', href: '/projects' },
        { label: project.name },
      ]} />
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
        <div className="overflow-x-auto pb-px -mb-px">
        <TabsList className="w-max min-w-full">
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
          <TabsTrigger value="workflow" className="flex items-center gap-2">
             <Cpu className="w-4 h-4 opacity-70" />
             Workflow
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Overview Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-border-primary p-4">
              <p className="text-xs text-text-secondary mb-1">Tasks</p>
              <p className="text-2xl font-semibold text-text-primary">
                {completedTasks}<span className="text-base text-text-secondary font-normal">/{totalTasks}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">completed</p>
            </div>
            <div className="bg-white rounded-xl border border-border-primary p-4">
              <p className="text-xs text-text-secondary mb-1">Status</p>
              <div className="mt-1">
                <Badge variant={project.status === 'ACTIVE' ? 'success' : project.status === 'COMPLETED' ? 'info' : 'default'}>
                  {project.status ?? 'Unknown'}
                </Badge>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border-primary p-4">
              <p className="text-xs text-text-secondary mb-1">Stories</p>
              <p className="text-2xl font-semibold text-text-primary">{stories.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-border-primary p-4">
              <p className="text-xs text-text-secondary mb-1">Created</p>
              <p className="text-sm font-medium text-text-primary">
                {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {/* Repository */}
          <div className="bg-white rounded-xl border border-border-primary p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-gray-400" />
              Repository
            </h3>
            {project.repo_path && (
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-text-secondary">Local path</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-text-primary bg-gray-50 px-2.5 py-1 rounded-md">{project.repo_path}</code>
                  <CopyButton text={project.repo_path} />
                </div>
              </div>
            )}
            {project.github_path && (
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-text-secondary">GitHub</span>
                <div className="flex items-center gap-2">
                  <a href={project.github_path} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-blue-600 hover:underline font-mono">{project.github_path}</a>
                  <CopyButton text={project.github_path} />
                </div>
              </div>
            )}
            {!project.repo_path && !project.github_path && (
              <p className="text-sm text-text-secondary">No repository configured yet.</p>
            )}
          </div>

          {/* Activity Logs */}
          <div className="space-y-4">
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
                   <Link href={`/brief/${project.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-border-primary rounded-lg hover:bg-gray-50 transition-colors">
                     <Edit className="w-3 h-3" /> Edit Brief
                   </Link>
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
                   <Link href={`/architecture/${id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-border-primary rounded-lg hover:bg-gray-50 transition-colors">
                     <Edit className="w-3 h-3" /> Edit Architecture
                   </Link>
                </Link>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                {(() => {
                  const diagrams = Array.isArray(project.architecture_specs?.diagrams)
                    ? (project.architecture_specs.diagrams as Array<{ name?: string; code?: string; content?: string }>)
                    : [];
                  const stackDecisions = (project.architecture_specs?.stack_decisions != null &&
                    typeof project.architecture_specs.stack_decisions === 'object' &&
                    !Array.isArray(project.architecture_specs.stack_decisions))
                    ? (project.architecture_specs.stack_decisions as Record<string, unknown>)
                    : {};
                  const hasContent = project.architecture_specs?.content || diagrams.length > 0 || Object.keys(stackDecisions).length > 0;
                  return hasContent ? (
                  <div className="space-y-10">
                    {project.architecture_specs?.content && <Markdown>{project.architecture_specs.content}</Markdown>}

                    {/* Diagrams Section */}
                    {diagrams.length > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 not-prose">
                                <Cpu className="w-5 h-5 text-blue-500" /> Architecture Diagrams
                            </h3>
                            <div className="space-y-8">
                                {diagrams.map((diag, i) => (
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
                    {Object.keys(stackDecisions).length > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 not-prose">
                                <Code2 className="w-5 h-5 text-purple-500" /> Tech Stack Decisions
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 not-prose">
                                {Object.entries(stackDecisions).map(([key, value]) => (
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
                  );
                })()}
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
                 <Link href={`/ui-specs/${id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-border-primary rounded-lg hover:bg-gray-50 transition-colors">
                   <Edit className="w-3 h-3" /> Edit UI Specs
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
                        {project.ui_specs?.design_system && (() => {
                           const dsJson = JSON.stringify(project.ui_specs.design_system, null, 2);
                           return (
                             <div>
                               <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Design System Tokens</h4>
                               <div className="relative group">
                                 <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[300px]">
                                   {dsJson}
                                 </pre>
                                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <CopyButton text={dsJson} className="bg-gray-700 text-gray-300 hover:bg-gray-600" />
                                 </div>
                               </div>
                             </div>
                           );
                        })()}
                        {project.ui_specs?.components && (() => {
                           const compJson = JSON.stringify(project.ui_specs.components, null, 2);
                           return (
                             <div>
                               <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Components</h4>
                               <div className="relative group">
                                 <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[300px]">
                                   {compJson}
                                 </pre>
                                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <CopyButton text={compJson} className="bg-gray-700 text-gray-300 hover:bg-gray-600" />
                                 </div>
                               </div>
                             </div>
                           );
                        })()}
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
               <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <EmptyState
                     icon={Bot}
                     title="No agents assigned yet"
                     description="Agents will appear here once you run a workflow for this project."
                  />
               </div>
            )}
         </TabsContent>
          {/* Workflow Content */}
          <TabsContent value="workflow">
            <ProjectWorkflowPanel projectId={id} projectName={project.name} />
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

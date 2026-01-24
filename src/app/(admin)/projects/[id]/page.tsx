import { prisma } from '@/lib/db'
import Link from 'next/link'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TasksTable } from '@/components/tasks/TasksTable'
import { StoriesTable } from '@/components/stories/StoriesTable'
import { Edit, FileText, LayoutTemplate, Plus, ExternalLink, GitBranch } from 'lucide-react'

interface Params { params: { id: string } }

function mapPriority(p: number): string {
  if (p >= 4) return 'URGENT'
  if (p === 3) return 'HIGH'
  if (p === 2) return 'MEDIUM'
  return 'LOW'
}

export default async function ProjectDetail({ params }: Params) {
  const id = params.id
  
  const [project, tasks, stories] = await Promise.all([
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
            <Link href={`/projects/${id}/tasks/new`}>
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
                <CardContent>
                  {project.repo_path ? (
                    <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-100 break-all">
                      {project.repo_path}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No repository linked</span>
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

import Link from 'next/link'
import { getStoryById } from '@/lib/dal/user_stories.dal'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { ArrowLeft, Edit, CheckCircle2, User, Target, Lightbulb, ListChecks } from 'lucide-react'


function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
    PENDING: 'default',
    APPROVED: 'primary',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    REJECTED: 'error',
  }
  return <Badge variant={map[status || 'PENDING'] || 'default'}>{status || 'PENDING'}</Badge>
}

interface StoryDetailProps {
  params: Promise<{ id: string }>;
}

export default async function StoryDetail({ params }: StoryDetailProps) {
  const { id } = await params
  
  const story = await getStoryById(id)

  if (!story) return <div className="p-8">User Story not found</div>

  const acceptanceCriteria = Array.isArray(story.acceptance_criteria) 
    ? story.acceptance_criteria 
    : []

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <Link href="/user-stories" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Stories
      </Link>

      <SectionHeader 
        title={
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-3">
                <span className="text-gray-400 font-normal text-lg">#{story.id.slice(0,8)}</span>
                {story.title}
             </div>
             <div className="flex gap-2">
                <StatusBadge status={story.status} />
                <Badge variant={story.priority === 'URGENT' ? 'error' : 'default'} size="sm">
                   {story.priority || 'NO PRIORITY'}
                </Badge>
             </div>
          </div>
        }
        actions={
          <Link href={`/user-stories/${id}/edit`}>
            <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
              Edit Story
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader>
                    <CardTitle className="text-base text-gray-500 uppercase tracking-wider">The Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                     <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                     
                     <div className="pl-8 relative">
                        <div className="absolute -left-[39px] top-0 bg-blue-100 p-2 rounded-full border-4 border-white">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">As a...</h3>
                        <p className="text-lg font-medium text-gray-900">{story.role || 'User'}</p>
                     </div>

                     <div className="pl-8 relative">
                         <div className="absolute -left-[39px] top-0 bg-purple-100 p-2 rounded-full border-4 border-white">
                            <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">I want to...</h3>
                        <p className="text-lg font-medium text-gray-900">{story.goal || 'Perform an action'}</p>
                     </div>

                     <div className="pl-8 relative">
                         <div className="absolute -left-[39px] top-0 bg-green-100 p-2 rounded-full border-4 border-white">
                            <Lightbulb className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">So that...</h3>
                        <p className="text-lg font-medium text-gray-900">{story.benefit || 'I achieve a result'}</p>
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-gray-500" />
                        Acceptance Criteria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {acceptanceCriteria.length > 0 ? (
                        <ul className="space-y-3">
                            {acceptanceCriteria.map((criteria: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{criteria}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic text-center py-4">No acceptance criteria defined.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Project Context</CardTitle>
                </CardHeader>
                <CardContent>
                    {story.projects ? (
                        <div>
                             <span className="text-xs text-gray-400 block mb-1">Project</span>
                             <Link href={`/projects/${story.projects.id}`} className="text-blue-600 hover:underline text-base font-medium">
                                {story.projects.name}
                            </Link>
                        </div>
                    ) : (
                        <span className="text-gray-400">Not assigned to a project</span>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

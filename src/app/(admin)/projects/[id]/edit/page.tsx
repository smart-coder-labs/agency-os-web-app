import { getProjectById } from '@/lib/dal/projects.dal'
import { ProjectForm } from '../../_components/ProjectForm'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <Link href={`/projects/${id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project
      </Link>

      <SectionHeader 
        title="Edit Project" 
        description={`Update settings for ${project.name}`}
      />

      <Card>
        <CardContent className="pt-6">
          <ProjectForm project={project} />
        </CardContent>
      </Card>
    </div>
  )
}

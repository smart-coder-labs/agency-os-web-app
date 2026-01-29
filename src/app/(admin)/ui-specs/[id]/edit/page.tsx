import { getProjectById } from '@/lib/dal/projects.dal'
import { UiSpecsForm } from '@/app/(admin)/_components/ui-specs/UiSpecsForm'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditUiSpecsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUiSpecsPage({ params }: EditUiSpecsPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <Link 
          href={`/projects/${id}`} 
          className="inline-flex items-center text-sm text-text-tertiary hover:text-accent-blue transition-apple font-medium group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Project
        </Link>
      </div>

      <SectionHeader 
        title="UI Specifications" 
        description={`Update design specs for ${project.name}`}
      />

      <div className="mt-8">
        <UiSpecsForm projectId={id} initialData={project.ui_specs || {}} />
      </div>
    </div>
  )
}

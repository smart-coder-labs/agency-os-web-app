import { ProjectBriefForm } from '@/app/(admin)/_components/brief/ProjectBriefForm'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditBriefPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBriefPage({ params }: EditBriefPageProps) {
  const { id } = await params

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
        title="Edit Project Brief" 
        description="Refine the project goals, audience, and core strategy."
      />

      <div className="mt-8">
        <ProjectBriefForm projectId={id} />
      </div>
    </div>
  )
}

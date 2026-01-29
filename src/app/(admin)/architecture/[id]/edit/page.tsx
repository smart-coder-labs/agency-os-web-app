import { ArchitectureSpecsForm } from '@/app/(admin)/_components/architecture/ArchitectureSpecsForm'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditArchitecturePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArchitecturePage({ params }: EditArchitecturePageProps) {
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
        title="Architecture Specifications" 
        description="Design the system architecture, diagrams, and technology stack."
      />

      <div className="mt-8">
        <ArchitectureSpecsForm projectId={id} />
      </div>
    </div>
  )
}

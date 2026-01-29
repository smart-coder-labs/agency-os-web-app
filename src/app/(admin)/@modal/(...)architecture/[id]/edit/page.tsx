import { ModalWrapper } from '@/app/(admin)/_components/ModalWrapper'
import { ArchitectureSpecsForm } from '@/app/(admin)/_components/architecture/ArchitectureSpecsForm'
import { getProjectById } from '@/lib/dal/projects.dal'
import { notFound } from 'next/navigation'

export default async function ArchitectureSpecsModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) notFound()
  
  return (
    <ModalWrapper title="Architecture Specifications" position="right" size="xl">
      <ArchitectureSpecsForm 
        projectId={id} 
        initialData={project.architecture_specs} 
      />
    </ModalWrapper>
  )
}

import { ModalWrapper } from '@/app/(admin)/_components/ModalWrapper'
import { UiSpecsForm } from '@/app/(admin)/_components/ui-specs/UiSpecsForm'
import { getProjectById } from '@/lib/dal/projects.dal'
import { notFound } from 'next/navigation'

export default async function EditUiSpecsModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) notFound()

  return (
    <ModalWrapper title="UI Specifications" position="right" size="xl">
      <UiSpecsForm 
        projectId={id} 
        initialData={project.ui_specs || {}}
      />
    </ModalWrapper>
  )
}

import { getProjectById } from '@/lib/dal/projects.dal'
import { ProjectForm } from '@/app/(admin)/projects/_components/ProjectForm'
import { ModalWrapper } from '@/app/(admin)/_components/ModalWrapper'

interface EditProjectModalProps {
  params: { id: string };
}

export default async function EditProjectModal({ params }: EditProjectModalProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) return null

  return (
    <ModalWrapper position='right' title="Edit Project">
      <ProjectForm project={project} />
    </ModalWrapper>
  )
}

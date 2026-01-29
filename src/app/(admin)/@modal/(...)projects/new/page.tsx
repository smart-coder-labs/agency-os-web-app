import { ProjectForm } from '@/app/(admin)/projects/_components/ProjectForm'
import { ModalWrapper } from '@/app/(admin)/_components/ModalWrapper'

export default function CreateProjectModal() {
  return (
    <ModalWrapper position='right' size="xl" title="Create New Project">
      <ProjectForm />
    </ModalWrapper>
  )
}

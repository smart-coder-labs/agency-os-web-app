'use client'

import { Modal, ModalHeader, ModalTitle, ModalContent } from '@/shared/components/ui/Modal'
import { ProjectForm } from '@/app/(admin)/projects/_components/ProjectForm'
import { useRouter } from 'next/navigation'

export default function CreateProjectModal() {
  const router = useRouter()

  const handleClose = () => {
    setTimeout(() => {
      router.back()
    }, 200) // Small delay for animation
  }

  return (
    <Modal open position='right' onOpenChange={handleClose} size="lg">
      <ModalHeader>
        <ModalTitle>Create New Project</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <ProjectForm onCancel={handleClose} />
      </ModalContent>
    </Modal>
  )
}

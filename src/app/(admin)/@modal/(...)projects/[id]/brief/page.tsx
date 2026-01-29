'use client'

import { ModalWrapper } from '@/app/(admin)/_components/ModalWrapper'
import { ProjectBriefForm } from '@/app/(admin)/projects/[id]/brief/_components/ProjectBriefForm'
import { useParams, useRouter } from 'next/navigation'

export default function ProjectBriefModal() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  return (
    <ModalWrapper title="Project Brief" size="full">
      <ProjectBriefForm 
        projectId={id} 
        onSuccess={() => {
          router.back()
          router.refresh()
        }}
      />
    </ModalWrapper>
  )
}

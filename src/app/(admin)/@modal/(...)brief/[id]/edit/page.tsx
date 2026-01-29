'use client'

import { ModalWrapper } from '@/app/(admin)/_components/ModalWrapper'
import { ProjectBriefForm } from '@/app/(admin)/_components/brief/ProjectBriefForm'
import { useRouter, useParams } from 'next/navigation'
import { use } from 'react'

export default function ProjectBriefModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
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

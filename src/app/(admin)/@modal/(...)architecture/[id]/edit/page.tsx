'use client'

import { ModalWrapper } from '@/app/(admin)/_components/ModalWrapper'
import { ArchitectureSpecsForm } from '@/app/(admin)/_components/architecture/ArchitectureSpecsForm'
import { useRouter, useParams } from 'next/navigation'
import { use } from 'react'

export default function ArchitectureSpecsModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  return (
    <ModalWrapper title="Architecture Specifications" position='right' size="xl">
      <ArchitectureSpecsForm 
        projectId={id} 
        onSuccess={() => {
          router.back()
          router.refresh()
        }} 
      />
    </ModalWrapper>
  )
}

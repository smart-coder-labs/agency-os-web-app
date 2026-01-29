'use client'

import { Modal, ModalHeader, ModalTitle, ModalContent, ModalProps } from '@/shared/components/ui/Modal'
import { useRouter } from 'next/navigation'
import { useState, useEffect, ReactNode } from 'react'

interface ModalWrapperProps extends Partial<ModalProps> {
  children: ReactNode;
  title: string;
}

export function ModalWrapper({ children, title, size = 'xl', ...props }: ModalWrapperProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      router.back()
    }, 200)
  }

  return (
    <Modal {...props} size={size} open={isOpen} onOpenChange={handleClose}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalContent>
        {children}
      </ModalContent>
    </Modal>
  )
}

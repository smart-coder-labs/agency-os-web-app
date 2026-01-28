'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { useRouter } from 'next/navigation'
import { ProjectForm } from '@/app/(admin)/projects/_components/ProjectForm'

export default function NewProjectPage() {
  const router = useRouter()

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <Link href="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
      </Link>

      <SectionHeader 
        title="Create New Project" 
        description="Initialize a new project within Agency OS."
      />

      <Card>
        <CardContent className="pt-6">
          <ProjectForm onCancel={() => router.push('/projects')} />
        </CardContent>
      </Card>
    </div>
  )
}

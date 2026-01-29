"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { Markdown } from '@/shared/components/ui/Markdown'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Save, Eye, Edit2, Loader2, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { use } from 'react'

import { ProjectBriefForm } from './_components/ProjectBriefForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProjectBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <Link 
          href={`/projects/${projectId}`} 
          className="inline-flex items-center text-sm text-text-tertiary hover:text-accent-blue transition-apple font-medium group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Project
        </Link>
      </div>

      <SectionHeader 
        title="Project Brief" 
        description="Define strategies, goals, and target audience."
      />

      <div className="mt-8">
        <ProjectBriefForm projectId={projectId} />
      </div>
    </div>
  )
}

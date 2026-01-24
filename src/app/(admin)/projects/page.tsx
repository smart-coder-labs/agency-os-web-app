import { prisma } from '@/lib/db'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const projects = await prisma.projects.findMany({ 
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader 
        title="Projects" 
        description="Manage your ongoing projects and workflows."
        actions={
          <Link href="/projects/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Project
            </Button>
          </Link>
        }
      />
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <ProjectsTable data={projects as any[]} />
      </div>
    </div>
  )
}

import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { StoriesTable } from '@/components/stories/StoriesTable'
import { Plus } from 'lucide-react'

export default async function StoriesPage() {
  const rows = await prisma.user_stories.findMany({ 
    orderBy: { created_at: 'desc' },
    include: {
      projects: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  // Map data to match StoriesTable expected format
  const formattedStories = rows.map((story: any) => ({
    ...story,
    project: story.projects, // Map plural DB relation to singular component prop
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader 
        title="User Stories" 
        description="Define and prioritize user requirements and features."
        actions={
          <Link href="/user-stories/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Story
            </Button>
          </Link>
        }
      />
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <StoriesTable data={formattedStories} />
      </div>
    </div>
  )
}

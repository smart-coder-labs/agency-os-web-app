"use client"

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'

export function ProjectsPageHeader() {
    return (
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
    )
}

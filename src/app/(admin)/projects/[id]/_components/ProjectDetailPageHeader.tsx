"use client"

import Link from 'next/link'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Edit, BookOpen, Plus } from 'lucide-react'

interface ProjectDetailPageHeaderProps {
    project: {
        name: string;
        status: string;
        description?: string | null;
    };
    id: string;
}

export function ProjectDetailPageHeader({ project, id }: ProjectDetailPageHeaderProps) {
    return (
        <SectionHeader 
            title={
                <div className="flex items-center gap-3">
                    {project.name}
                    <Badge variant={project.status === 'COMPLETED' ? 'success' : 'primary'} size="sm">
                        {project.status}
                    </Badge>
                </div>
            }
            description={project.description || 'No description provided.'}
            actions={
                <div className="flex items-center gap-2">
                    <Link href={`/projects/${id}/edit`}>
                        <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
                            Edit
                        </Button>
                    </Link>
                    <Link href={`/user-stories/new?projectId=${id}`}>
                        <Button variant="secondary" leftIcon={<BookOpen className="w-4 h-4" />}>
                            Add Story
                        </Button>
                    </Link>
                    <Link href={`/tasks/new?projectId=${id}`}>
                        <Button leftIcon={<Plus className="w-4 h-4" />}>
                            Add Task
                        </Button>
                    </Link>
                </div>
            }
        />
    )
}

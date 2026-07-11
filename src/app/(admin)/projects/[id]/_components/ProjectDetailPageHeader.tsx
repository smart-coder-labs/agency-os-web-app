"use client"

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Edit, BookOpen, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { deleteProjectById } from '@/app/(admin)/projects/_actions/project-actions'

function MoreMenu({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const action = deleteProjectById.bind(null, projectId)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border-primary bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        aria-label="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-border-primary shadow-lg z-20 overflow-hidden py-1">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete project
            </button>
          ) : (
            <div className="px-3.5 py-3 space-y-2.5">
              <p className="text-xs text-gray-600 font-medium">Delete this project?</p>
              <p className="text-xs text-gray-400">This action cannot be undone.</p>
              <div className="flex gap-2 pt-1">
                <form action={action} className="flex-1">
                  <button type="submit" className="w-full px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => { setConfirming(false); setOpen(false) }}
                  className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ProjectDetailPageHeaderProps {
  project: {
    name: string;
    status: string | null;
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
          <MoreMenu projectId={id} />
        </div>
      }
    />
  )
}

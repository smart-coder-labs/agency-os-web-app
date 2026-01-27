"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Table, Column } from '@/shared/components/ui/Table'
import { Badge } from '@/shared/components/ui/Badge'

type UserStory = {
  id: string
  title: string
  role: string | null
  priority: string | null
  status: string | null
  project?: {
    name: string
    id: string
  }
}

const statusVariantMap: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
  PENDING: 'default',
  APPROVED: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  REJECTED: 'error',
}

const priorityVariantMap: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'error',
}

export function StoriesTable({ data }: { data: UserStory[] }) {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const columns: Column<UserStory>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, row) => (
        <Link 
          href={`/user-stories/${row.id}`}
          className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
        >
          {value}
        </Link>
      )
    },
    {
      key: 'project',
      header: 'Project',
      sortable: true,
      render: (_, row) => (
        row.project ? (
          <Link href={`/projects/${row.project.id}`} className="text-gray-600 hover:text-blue-600">
            {row.project.name}
          </Link>
        ) : <span className="text-gray-400">—</span>
      )
    },
    {
      key: 'role',
      header: 'As a...',
      sortable: true,
      render: (value) => <span className="text-gray-600">{value || '—'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const normalized = value || 'PENDING'
        const variant = statusVariantMap[normalized] || 'default'
        return (
          <Badge variant={variant} size="sm" dot>
            {normalized}
          </Badge>
        )
      }
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (value) => {
        const normalized = value || 'LOW'
        const variant = priorityVariantMap[normalized] || 'default'
        return (
          <Badge variant={variant} size="sm">
            {normalized}
          </Badge>
        )
      }
    }
  ]

  return (
    <Table
      columns={columns} 
      data={data} 
    //   selectable
      hoverable
      striped={false}
      density="comfortable"
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
    />
  )
}

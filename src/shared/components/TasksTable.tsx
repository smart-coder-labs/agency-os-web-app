"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Table, Column } from '@/shared/components/ui/Table'
import { Badge } from '@/shared/components/ui/Badge'

type Task = {
  id: string
  title: string
  type: string
  status: string
  priority: string
  project?: {
    name: string
    id: string
  }
}

const statusVariantMap: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
  TODO: 'default',
  IN_PROGRESS: 'primary',
  REVIEW: 'info',
  DONE: 'success',
  BLOCKED: 'error',
}

const priorityVariantMap: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'error',
}

export function TasksTable({ data }: { data: Task[] }) {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const columns: Column<Task>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, row) => (
        <Link 
          href={`/tasks/${row.id}`}
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
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => <span className="capitalize text-gray-600">{value?.toLowerCase().replace('_', ' ')}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const variant = statusVariantMap[value] || 'default'
        return (
          <Badge variant={variant} size="sm" dot>
            {value?.replace('_', ' ')}
          </Badge>
        )
      }
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (value) => {
        const variant = priorityVariantMap[value] || 'default'
        return (
          <Badge variant={variant} size="sm">
            {value}
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

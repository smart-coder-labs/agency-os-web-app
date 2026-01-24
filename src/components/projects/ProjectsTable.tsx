"use client"
import { Table, Column } from '@/components/ui/Table'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  created_at: string | Date
}

const statusVariantMap: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
  DISCOVERY: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  ON_HOLD: 'warning',
  CANCELLED: 'error',
}

export function ProjectsTable({ data }: { data: Project[] }) {
  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, row) => (
        <Link 
          href={`/projects/${row.id}`}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          {value}
        </Link>
      )
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 truncate max-w-[300px] block" title={value}>
          {value || '—'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const variant = statusVariantMap[value] || 'default'
        return (
          <Badge variant={variant} size="sm" dot>
            {value}
          </Badge>
        )
      }
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  return (
    <Table
      columns={columns} 
      data={data} 
      selectable
      hoverable
      striped={false}
      density="comfortable"
      pageSize={10}
    />
  )
}

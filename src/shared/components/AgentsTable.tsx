"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Table, Column } from '@/shared/components/ui/Table'
import { Badge } from '@/shared/components/ui/Badge'

export type Agent = {
  id: string
  name: string
  role: string
  model: string
  is_active: boolean
  status?: string
  currentTask?: string
}

export function AgentsTable({ data }: { data: Agent[] }) {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
        case 'processing': return <Badge variant="primary" size="sm" dot className="animate-pulse">Processing</Badge>
        case 'error': return <Badge variant="error" size="sm" dot>Error</Badge>
        case 'learning': return <Badge variant="warning" size="sm" dot>Learning</Badge>
        case 'idle': return <Badge variant="default" size="sm" dot>Idle</Badge>
        default: return <Badge variant="default" size="sm" dot>Offline</Badge>
    }
  }

  const columns: Column<Agent>[] = [
    {
      key: 'name',
      header: 'Agent & Role',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
            <Link 
              href={`/agents/${row.id}`}
              className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
            >
              {value}
            </Link>
            <span className="text-xs text-gray-500">{row.role}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, row) => getStatusBadge(value || (row.is_active ? 'idle' : 'offline'))
    },
    {
      key: 'model',
      header: 'Model',
      sortable: true,
      render: (value) => <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">{value}</span>
    },
    {
      key: 'currentTask',
      header: 'Current Task',
      sortable: true,
      render: (value) => <span className="text-gray-600 truncate max-w-[200px] block">{value || 'No active task'}</span>
    }
  ]

  return (
    <Table
      columns={columns} 
      data={data} 
      hoverable
      striped={false}
      density="comfortable"
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
    />
  )
}

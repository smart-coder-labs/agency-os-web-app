"use client"

import { useState } from 'react'
import { Table, Column } from '@/components/ui/Table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

type User = {
  id: string
  email: string
  full_name: string | null
  created_at: string | Date
}

export function UsersTable({ data }: { data: User[] }) {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const columns: Column<User>[] = [
    {
      key: 'full_name',
      header: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarImage src="" alt={value || row.email} />
            <AvatarFallback>{getInitials(value)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-text-primary">{value || 'Unknown Name'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (value) => <span className="text-text-secondary">{value}</span>
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'id',
      header: 'Status',
      render: () => (
        <Badge variant="success" size="sm" dot>
          Active
        </Badge>
      )
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

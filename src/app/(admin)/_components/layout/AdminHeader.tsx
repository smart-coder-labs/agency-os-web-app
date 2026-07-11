"use client"

import { useState } from 'react'
import { SearchInput } from '@/shared/components/ui/SearchInput'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'

export default function AdminHeader() {
  const [search, setSearch] = useState('')

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5"
      style={{
        background: 'var(--color-surface-glass)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Admin Console
      </div>
      <div className="flex items-center gap-3">
        <div className="w-64">
          <SearchInput
            placeholder="Search..."
            value={search}
            onChange={(val) => setSearch(val)}
          />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

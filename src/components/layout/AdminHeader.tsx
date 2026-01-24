"use client"

import { useState } from 'react'
import { SearchInput } from '@/components/ui/SearchInput'

export default function AdminHeader() {
  const [search, setSearch] = useState('')

  return (
    <header className="bg-white/50 backdrop-blur-xl border-b border-[var(--color-border)] sticky top-0 z-10">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-500">Admin Console</div>
        <div className="w-64">
          <SearchInput 
            placeholder="Search..." 
            value={search} 
            onChange={(val) => setSearch(val)} 
          />
        </div>
      </div>
    </header>
  )
}

"use client"

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'

export function AgentsPageHeader() {
    return (
        <SectionHeader 
            title="Agent Monitor" 
            description="Real-time monitoring and management of AI agents."
            actions={
                <Link href="/agents/new">
                    <Button leftIcon={<Plus className="w-4 h-4"/>}>Register New Agent</Button>
                </Link>
            }
        />
    )
}

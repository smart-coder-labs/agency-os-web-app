import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { AgentsDashboard } from './AgentsDashboard'

export default async function AgentsPage() {
    // Fetch agents from DB
    const agents = await prisma.agents.findMany({
        orderBy: { name: 'asc' },
        include: {
            agent_skills: true
        }
    })
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <SectionHeader 
                title="Agent Monitor" 
                description="Real-time monitoring and management of AI agents."
                actions={
                    <Link href="/agents/new">
                        <Button leftIcon={<Plus className="w-4 h-4"/>}>Register New Agent</Button>
                    </Link>
                }
            />
            
            <AgentsDashboard agents={agents as any[]} />
        </div>
    )
}


import { prisma } from '@/lib/db'
import { AgentDetailDashboard } from './AgentDetailDashboard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Params { params: Promise<{ id: string }> }

export default async function AgentDetailPage({ params }: Params) {
    const { id } = await params
     
    // Fetch Agent + Metrics + Jobs + Logs
    const [agent, metrics, jobs, logs] = await Promise.all([
        prisma.agents.findUnique({ where: { id } }),
        prisma.agent_metrics.findMany({
            where: { agent_id: id },
            orderBy: { created_at: 'desc' },
            take: 50 // Last 50 points
        }),
        prisma.agent_jobs.findMany({
            where: { agent_id: id },
            orderBy: { created_at: 'desc' },
            take: 100
        }),
        prisma.execution_logs.findMany({
            where: { agent_id: id },
            orderBy: { created_at: 'desc' },
            take: 50
        })
    ])

    if (!agent) {
        return <div className="p-8">Agent not found</div>
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <Link href="/agents" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Agents
             </Link>

            <AgentDetailDashboard 
                agent={agent}
                metrics={metrics}
                jobs={jobs}
                logs={logs}
            />
        </div>
    )
}

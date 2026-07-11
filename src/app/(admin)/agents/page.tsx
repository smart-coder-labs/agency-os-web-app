import { AgentsDashboard } from './AgentsDashboard'
import { AgentsPageHeader } from './_components/AgentsPageHeader'
import { getAllAgents } from '@/lib/dal/agents.dal'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Bot } from 'lucide-react'

export default async function AgentsPage() {
    // Fetch agents using DAL
    const agents = await getAllAgents()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <AgentsPageHeader />

            {agents.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <EmptyState
                        icon={Bot}
                        title="No agents registered"
                        description="Agents are automatically registered when you run a workflow for a project."
                    />
                </div>
            ) : (
                <AgentsDashboard agents={agents as any[]} />
            )}
        </div>
    )
}

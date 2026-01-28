import { AgentsDashboard } from './AgentsDashboard'
import { AgentsPageHeader } from './_components/AgentsPageHeader'
import { getAllAgents } from '@/lib/dal/agents.dal'

export default async function AgentsPage() {
    // Fetch agents using DAL
    const agents = await getAllAgents()
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <AgentsPageHeader />
            
            <AgentsDashboard agents={agents as any[]} />
        </div>
    )
}

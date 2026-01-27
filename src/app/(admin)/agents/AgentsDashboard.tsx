"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Search, Filter, MoreVertical, Plus, Bot, Zap, Database, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { StatisticDisplay } from '@/shared/components/ui/StatisticDisplay'
import { AgentsTable } from '@/shared/components/AgentsTable'

interface Agent {
    id: string
    name: string
    role: string
    model: string
    is_active: boolean
    status?: 'processing' | 'idle' | 'error' | 'learning'
    currentTask?: string
    performance?: number[] // Array of values for sparkline
}

interface AgentsDashboardProps {
    agents: Agent[]
}

export function AgentsDashboard({ agents: initialAgents }: AgentsDashboardProps) {
    const [filter, setFilter] = useState<'all' | 'processing' | 'idle' | 'error'>('all')
    const [search, setSearch] = useState('')

    // Mock status/task augmentation since DB doesn't have it yet
    const agents = initialAgents.map(a => ({
        ...a,
        status: a.status || (Math.random() > 0.7 ? 'processing' : Math.random() > 0.9 ? 'error' : 'idle'),
        currentTask: a.currentTask || (Math.random() > 0.7 ? 'Analyzing code structure...' : 'Waiting for next prompt'),
        performance: Array.from({ length: 8 }, () => Math.floor(Math.random() * 100))
    })) as Agent[]

    const filteredAgents = agents.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                             a.role.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'all' || a.status === filter
        return matchesSearch && matchesFilter
    })

    const activeCount = agents.filter(a => a.status === 'processing').length
    const totalTokens = "1.2M" // Mock

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'processing': return <Badge variant="primary" size="sm" className="animate-pulse">Processing</Badge>
            case 'error': return <Badge variant="error" size="sm">Error</Badge>
            case 'learning': return <Badge variant="warning" size="sm">Learning</Badge>
            default: return <Badge variant="default" size="sm">Idle</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Stats Summary Area */}
            <StatisticDisplay 
                metrics={[
                    {
                        id: 'total-agents',
                        label: 'Total Agents',
                        value: agents.length,
                        change: '+5% this week',
                        trend: 'up',
                        icon: <Bot className="w-5 h-5" />,
                        sparkline: [40, 45, 42, 48, 50, 48, 55],
                    },
                    {
                        id: 'active-now',
                        label: 'Active Now',
                        value: activeCount,
                        change: '+2% since 1h',
                        trend: 'up',
                        icon: <Zap className="w-5 h-5" />,
                        sparkline: [20, 30, 25, 35, 32, 40, 38],
                        sparklineAccent: 'green',
                    },
                    {
                        id: 'tokens-24h',
                        label: 'Tokens / 24h',
                        value: totalTokens,
                        change: '-1.2% usage',
                        trend: 'neutral',
                        icon: <Activity className="w-5 h-5" />,
                        sparkline: [80, 75, 82, 70, 65, 68, 62],
                        sparklineAccent: 'orange',
                    }
                ]}
                columns={3}
            />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-primary p-2 rounded-xl border border-border-primary shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto p-1">
                    {(['all', 'processing', 'idle', 'error'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                filter === f 
                                ? 'bg-surface-secondary text-text-primary shadow-sm' 
                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' && `(${agents.length})`}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                         <input 
                            placeholder="Search agents..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 rounded-lg bg-background-main border-none text-sm placeholder:text-text-tertiary focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                         />
                    </div>
                </div>
            </div>

            {/* Agents List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <AgentsTable data={filteredAgents} />
            </div>

        </div>
    )
}

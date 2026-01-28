"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Activity, Clock, CheckCircle2, AlertCircle, Play, StopCircle, RefreshCw, Cpu, Database } from 'lucide-react'
import { useState, useMemo } from 'react'
import { ResourceMonitor } from '@/shared/components/ui/ResourceMonitor'
import { ActivityLog, LogEntry } from '@/shared/components/ui/ActivityLog'
import { History } from 'lucide-react'
import { StatisticDisplay } from '@/shared/components/ui/StatisticDisplay'
import { cn } from '@/lib/utils'

interface AgentDetailProps {
    agent: any // Using any for initial scaffold, will type properly with Prism schema
    metrics: any[]
    jobs: any[]
    logs: any[]
}

export function AgentDetailDashboard({ agent, metrics, jobs, logs }: AgentDetailProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Calculate generic stats
    const successRate = jobs.length > 0 
        ? ((jobs.filter((j: any) => j.status === 'COMPLETED').length / jobs.length) * 100).toFixed(1) 
        : "0.0"
    
    // Calculate totals mock logic (replace with real aggregations later if needed)
    const totalCost = jobs.reduce((acc: number, j: any) => acc + (j.cost_usd || 0), 0).toFixed(4)
    const avgDuration = jobs.length > 0
        ? (jobs.reduce((acc: number, j: any) => acc + (j.duration_ms || 0), 0) / jobs.length / 1000).toFixed(1)
        : "0.0"

    // Map logs to LogEntry format
    const logEntries = useMemo<LogEntry[]>(() => {
        return logs.map((log: any) => ({
            id: log.id,
            status: (log.log_type?.toLowerCase() === 'error' ? 'warning' : 
                     log.log_type?.toLowerCase() === 'info' ? 'info' : 
                     log.log_type?.toLowerCase() === 'success' ? 'success' : 'info') as any,
            title: log.title || 'Agent Action',
            description: log.detail || 'Processing...',
            timestamp: new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
        }));
    }, [logs]);

    // Map metrics to ResourceMonitor format
    const resourceData = useMemo(() => {
        return metrics.slice(-20).map((m: any) => ({
            timestamp: new Date(m.created_at || Date.now()).getTime(),
            cpu: m.cpu_usage || 0,
            memory: (m.memory_usage || 0) / 1024, // Assuming we want visualization scaled
            tokens: m.token_count || 0, // Fallback if tokens per min isn't directly in metrics
        }));
    }, [metrics]);

    const latestMetric = metrics[metrics.length - 1] || {};

    return (
        <div className="space-y-6">
            {/* Header / Control Panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary p-6 rounded-xl border border-border-primary">
                <div>
                     <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-text-primary">Agent: {agent.name}</h1>
                        <Badge variant={agent.is_active ? 'success' : 'default'} dot>
                            {agent.is_active ? 'RUNNING' : 'STOPPED'}
                        </Badge>
                     </div>
                     <p className="text-sm text-text-secondary mt-1 font-mono">
                        ID: {agent.id.split('-')[0].toUpperCase()} | Model: {agent.model}
                     </p>
                </div>
                <div className="flex gap-2">
                     <Button variant="secondary" disabled leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}/>}>
                        Refresh
                     </Button>
                     {agent.is_active ? (
                        <Button disabled variant="destructive" leftIcon={<StopCircle className="w-4 h-4"/>}>
                            Terminate
                        </Button>
                     ) : (
                        <Button disabled variant="primary" leftIcon={<Play className="w-4 h-4"/>}>
                            Start Agent
                        </Button>
                     )}
                </div>
            </div>

            {/* KPI Metrics Area */}
            <StatisticDisplay 
                metrics={[
                    {
                        id: 'success-rate',
                        label: 'Success Rate',
                        value: `${successRate}%`,
                        change: '+1.2%',
                        trend: 'up',
                        icon: <CheckCircle2 className="w-5 h-5" />,
                        sparkline: [92, 94, 93, 95, 96, 95, 98],
                        sparklineAccent: 'blue',
                    },
                    {
                        id: 'avg-response',
                        label: 'Avg Response',
                        value: `${avgDuration}s`,
                        change: '-0.1s',
                        trend: 'down', // Down is good for response time
                        icon: <Clock className="w-5 h-5" />,
                        sparkline: [2.1, 1.9, 2.0, 1.8, 1.9, 1.7, 1.8],
                        sparklineAccent: 'purple',
                    },
                    {
                        id: 'total-cost',
                        label: 'Total Cost (24h)',
                        value: `$${totalCost}`,
                        description: `Est. monthly: $${(parseFloat(totalCost) * 30).toFixed(2)}`,
                        icon: <Database className="w-5 h-5" />,
                        trend: 'neutral',
                        sparkline: [0.12, 0.15, 0.14, 0.18, 0.16, 0.20, 0.19],
                        sparklineAccent: 'orange',
                    }
                ]}
                columns={3}
            />

            {/* Resource Monitor */}
            <ResourceMonitor 
                data={resourceData}
                currentCpu={latestMetric.cpu_usage || 0}
                currentMemory={parseFloat(((latestMetric.memory_usage || 0) / 1024).toFixed(1))}
                currentTokens={(latestMetric.token_count || 0) / 1000} // Assuming k tokens
                autoRefresh={false}
                showTimeRange={false}
            />

            {/* Logs and History Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Log Component */}
                <ActivityLog 
                    entries={logEntries} 
                    onClear={() => console.log('Clear logs')}
                    className="h-[500px]"
                />

                {/* Task History Component (Redesigned) */}
                <div className="bg-[#090C14] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[500px]">
                    <div className="px-6 py-5 flex items-center gap-3 border-b border-white/5">
                        <div className="p-1.5 bg-blue-500/10 rounded-md">
                            <History className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-200">Task History</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Custom Table/List for Tasks */}
                        <div className="w-full">
                            <div className="grid grid-cols-2 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Task Name</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Date</span>
                            </div>
                            
                            <div className="divide-y divide-white/5">
                                {jobs.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-sm text-gray-500">
                                        No tasks recorded
                                    </div>
                                ) : (
                                    jobs.map((job) => (
                                        <div key={job.id} className="grid grid-cols-2 px-6 py-4 hover:bg-white/[0.02] transition-colors items-center">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full flex-none shadow-[0_0_8px_rgba(59,130,246,0.4)]",
                                                    job.status === 'COMPLETED' ? "bg-blue-500" : "bg-red-500"
                                                )} />
                                                <span className="text-sm font-medium text-gray-200 truncate">
                                                    {job.task_name}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-400 text-right">
                                                {new Date(job.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer Info */}
                    <div className="px-6 py-4 border-t border-white/5">
                        <p className="text-xs text-gray-500">
                            Showing {jobs.length} of {jobs.length > 5 ? '124' : jobs.length} completed tasks
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

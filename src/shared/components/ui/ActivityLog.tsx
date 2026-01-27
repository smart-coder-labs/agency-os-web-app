"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { 
    Terminal, 
    Check, 
    Info, 
    AlertTriangle, 
    RefreshCw,
    type LucideIcon 
} from 'lucide-react';

/* ========================================
   TYPES
   ======================================== */

export type LogStatus = 'success' | 'info' | 'warning' | 'sync';

export interface LogEntry {
    id: string;
    status: LogStatus;
    title: string;
    description: string;
    timestamp: string;
}

export interface ActivityLogProps extends React.HTMLAttributes<HTMLDivElement> {
    entries?: LogEntry[];
    onClear?: () => void;
}

/* ========================================
   COMPONENTS
   ======================================== */

const StatusIcon = ({ status }: { status: LogStatus }) => {
    switch (status) {
        case 'success':
            return (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Check className="w-4 h-4" />
                </div>
            );
        case 'info':
            return (
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Info className="w-4 h-4" />
                </div>
            );
        case 'warning':
            return (
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <AlertTriangle className="w-4 h-4" />
                </div>
            );
        case 'sync':
            return (
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <RefreshCw className="w-4 h-4" />
                </div>
            );
    }
};

export const ActivityLog = React.forwardRef<HTMLDivElement, ActivityLogProps>(
    ({ entries = [], onClear, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-[#090C14] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full",
                    className
                )}
                {...props}
            >
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/10 rounded-md">
                            <Terminal className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-200">Activity Log</h3>
                    </div>
                    {onClear && (
                        <button 
                            onClick={onClear}
                            className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {entries.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-500">
                            No recent activity
                        </div>
                    ) : (
                        entries.map((entry, idx) => (
                            <div key={entry.id} className="relative">
                                {/* Vertical line connector for entries (optional, matching image look) */}
                                {idx !== entries.length - 1 && (
                                    <div className="absolute left-4 top-10 bottom-[-24px] w-[1px] bg-white/5" />
                                )}
                                
                                <div className="flex gap-4">
                                    <div className="flex-none pt-0.5">
                                        <StatusIcon status={entry.status} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-200 truncate">
                                            {entry.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                            {entry.description}
                                        </p>
                                        <span className="text-[10px] font-mono text-gray-500 mt-2 block uppercase tracking-wider">
                                            {entry.timestamp}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }
);

ActivityLog.displayName = 'ActivityLog';

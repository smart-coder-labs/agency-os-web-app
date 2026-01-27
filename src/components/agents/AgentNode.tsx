'use client'

import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { User, Cpu, ChevronDown, ChevronUp } from 'lucide-react'

export const AgentNode = memo(({ data }: any) => {
  const isCollapsed = data.isCollapsed;
  const onToggle = data.onToggle;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
        <div className="relative w-20 h-20 rounded-full bg-slate-900 border-2 border-blue-500/50 flex items-center justify-center text-white overflow-hidden shadow-2xl backdrop-blur-xl">
          {data.role.toLowerCase().includes('lead') || data.role.toLowerCase().includes('manager') ? (
            <User className="w-10 h-10 text-blue-400" />
          ) : (
            <Cpu className="w-10 h-10 text-indigo-400" />
          )}
        </div>
        
        {onToggle && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="absolute -right-2 -bottom-2 w-7 h-7 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all z-20 cursor-pointer scale-100 active:scale-90"
            title={isCollapsed ? "Expand communications" : "Collapse communications"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <div className="text-center px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 mt-1">
        <div className="text-[11px] font-bold text-white max-w-[120px] truncate">{data.name}</div>
        <div className="text-[9px] text-blue-400 uppercase tracking-tighter font-bold">{data.role}</div>
      </div>

      {/* Multiple handles for better routing */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-500 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500 !border-slate-900" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-500 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-500 !border-slate-900" />
    </div>
  )
})

AgentNode.displayName = 'AgentNode'

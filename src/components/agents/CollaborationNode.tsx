'use client'

import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { MessageSquare } from 'lucide-react'

export const CollaborationNode = memo(({ data }: any) => {
  return (
    <div className="relative group min-w-[150px] max-w-[350px]">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
      <div className="relative p-4 rounded-2xl bg-slate-900 border border-purple-500/30 backdrop-blur-xl shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl shrink-0">
            <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-[12px] text-slate-200 leading-relaxed font-medium break-words">
              {data.content || 'Collaboration message...'}
            </p>
            {data.type && (
              <span className="text-[9px] px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full uppercase font-bold text-purple-400 tracking-widest block w-fit">
                {data.type}
              </span>
            )}
          </div>
        </div>

        {/* Tail */}
        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 border-b border-r border-purple-500/30 rotate-45 transform"></div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-purple-500 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-purple-500 !border-slate-900" />
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-purple-500 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-purple-500 !border-slate-900" />
    </div>
  )
})

CollaborationNode.displayName = 'CollaborationNode'

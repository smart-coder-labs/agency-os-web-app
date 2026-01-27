'use client'

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  MarkerType,
  ConnectionLineType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { AgentNode } from './AgentNode'
import { CollaborationNode } from './CollaborationNode'

const nodeTypes = {
  agent: AgentNode,
  collaboration: CollaborationNode,
}

const defaultEdgeOptions = {
  type: ConnectionLineType.Bezier,
  animated: true,
}

interface AgentFlowProps {
  collaborations: any[]
  agents: any[]
}

export const AgentFlow = ({ collaborations = [], agents = [] }: AgentFlowProps) => {
  const [collapsedAgents, setCollapsedAgents] = useState<Record<string, boolean>>({})

  const toggleAgent = useCallback((agentId: string) => {
    setCollapsedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }))
  }, [])

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    if (agents.length === 0) return { nodes, edges }

    // Map agents as main nodes
    agents.forEach((agent, index) => {
      nodes.push({
        id: `agent-${agent.id}`,
        type: 'agent',
        data: { 
          name: agent.name, 
          role: agent.role,
          isCollapsed: !!collapsedAgents[agent.id],
          onToggle: () => toggleAgent(agent.id)
        },
        position: { 
          x: index * 600, 
          y: 450 // Agents at y=450
        },
      })
    })

    // Map collaborations
    collaborations.forEach((collab, index) => {
      // Helper function to find agent by ID or Name
      const findAgent = (idOrName: string) => {
        if (!idOrName) return null;
        return agents.find(a => 
          a.id === idOrName || 
          a.name === idOrName || 
          a.name.toLowerCase().includes(idOrName.toLowerCase()) ||
          idOrName.toLowerCase().includes(a.name.toLowerCase())
        );
      }

      const fromAgent = findAgent(collab.from_agent_id);
      const toAgent = findAgent(collab.to_agent_id);

      const fromIdx = fromAgent ? agents.indexOf(fromAgent) : -1;
      const toIdx = toAgent ? agents.indexOf(toAgent) : -1;

      // Determine visibility based on identified agents
      let isVisible = true;
      if (fromAgent && collapsedAgents[fromAgent.id]) isVisible = false;
      if (toAgent && collapsedAgents[toAgent.id]) isVisible = false;

      const collabNodeId = `collab-${collab.id}`;

      // Calculate X position: fallback to center if no agents found
      let xOffsetBase = (agents.length * 600) / 2;
      if (fromIdx !== -1 && toIdx !== -1) {
        xOffsetBase = (fromIdx * 600 + toIdx * 600) / 2;
      } else if (fromIdx !== -1) {
        xOffsetBase = fromIdx * 600 + 150;
      } else if (toIdx !== -1) {
        xOffsetBase = toIdx * 600 - 150;
      }

      // Vertical Staggering logic: 
      // Agents occupy the space around y=450.
      // We'll put some messages above (rows 0, 1) and some below (rows 2, 3, 4)
      const row = index % 5;
      let yOffset = 50; 
      if (row === 0) yOffset = 50;
      if (row === 1) yOffset = 230;
      if (row === 2) yOffset = 650; // Below agents
      if (row === 3) yOffset = 830; 
      if (row === 4) yOffset = 1010;

      // Horizontal micro-staggering
      const xStagger = (index % 4 === 0 ? 60 : (index % 4 === 1 ? -60 : (index % 4 === 2 ? 30 : -30)));

      // Always create the collaboration node
      nodes.push({
        id: collabNodeId,
        type: 'collaboration',
        data: { content: collab.content, type: collab.type },
        position: { 
          x: xOffsetBase + xStagger, 
          y: yOffset 
        },
        hidden: !isVisible,
      })

      // Edge from sender to message (if sender exists)
      if (fromAgent) {
        edges.push({
          id: `e-from-${collab.id}`,
          source: `agent-${fromAgent.id}`,
          target: collabNodeId,
          animated: true,
          hidden: !isVisible,
          style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
        })
      }

      // Edge from message to receiver (if receiver exists)
      if (toAgent) {
        edges.push({
          id: `e-to-${collab.id}`,
          source: collabNodeId,
          target: `agent-${toAgent.id}`,
          animated: true,
          hidden: !isVisible,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#a855f7',
          },
          style: { stroke: '#a855f7', strokeWidth: 2, opacity: 0.8 },
        })
      }
    })

    return { nodes, edges }
  }, [collaborations, agents, collapsedAgents, toggleAgent])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  return (
    <div className="w-full h-[800px] border border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-900 overflow-hidden relative shadow-2xl group">
      {/* Background Glows */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="absolute top-6 left-6 z-10 space-y-3">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="px-4 py-1.5 bg-white/5 dark:bg-slate-800/40 backdrop-blur-xl rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-300 shadow-xl">
                AI Agent Collaboration Graph
            </div>
        </div>
        <div className="text-[11px] text-slate-400 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 max-w-sm">
          {collaborations.length > 0 
            ? `Displaying ${collaborations.length} communication events between ${agents.length} agents.`
            : `No communication logs found between agents for this project.`}
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        colorMode="dark"
      >
        <Background color="#1e293b" variant={'lines' as any} gap={40} size={1} />
        <Controls className="bg-slate-800 border-slate-700 fill-slate-300" />
        <MiniMap 
          nodeStrokeWidth={3}
          maskColor="rgba(0, 0, 0, 0.4)"
          className="!bg-slate-900 !border-slate-800"
          nodeColor="#1e293b"
        />
      </ReactFlow>
    </div>
  )
}

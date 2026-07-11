'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Play, Square, Loader2, Terminal, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface StreamingToken { agent: string; text: string }

interface LogEntry {
  type?: 'phase_started' | 'phase_completed' | 'log' | 'error';
  message: string;
  timestamp: number;
  phase?: string;
}

interface ProjectWorkflowPanelProps {
  projectId: string;
  projectName: string;
}

const MAX_LOG_ENTRIES = 200;

function logColor(type: LogEntry['type']): string {
  switch (type) {
    case 'phase_started':
      return 'text-blue-400';
    case 'phase_completed':
      return 'text-green-400';
    case 'error':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

export function ProjectWorkflowPanel({ projectId, projectName }: ProjectWorkflowPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [userRequest, setUserRequest] = useState('');
  const [streamingToken, setStreamingToken] = useState<StreamingToken | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Socket.io connection
  useEffect(() => {
    const socket: Socket = io(backendUrl);

    socket.on('workflow_started', () => {
      setIsRunning(true);
      setLogs([]);
      setCurrentPhase(null);
    });

    socket.on('workflow_completed', (data: { result: string }) => {
      setIsRunning(false);
      setCurrentPhase(null);
      setStreamingToken(null);
      setLogs(prev => [
        ...prev.slice(-MAX_LOG_ENTRIES + 1),
        {
          type: 'phase_completed',
          message: `Workflow completed: ${data.result ?? ''}`.trim(),
          timestamp: Date.now(),
        },
      ]);
    });

    socket.on('workflow_failed', (data: { error: string }) => {
      setIsRunning(false);
      setCurrentPhase(null);
      setStreamingToken(null);
      setLogs(prev => [
        ...prev.slice(-MAX_LOG_ENTRIES + 1),
        {
          type: 'error',
          message: `Workflow failed: ${data.error}`,
          timestamp: Date.now(),
        },
      ]);
    });

    socket.on('phase_started', (data: { phase: string }) => {
      setCurrentPhase(data.phase);
      setLogs(prev => [
        ...prev.slice(-MAX_LOG_ENTRIES + 1),
        {
          type: 'phase_started',
          message: `Phase started: ${data.phase}`,
          timestamp: Date.now(),
          phase: data.phase,
        },
      ]);
    });

    socket.on('workflow_phase_update', (data: { phase: string; status: 'started'; runId: string }) => {
      setCurrentPhase(data.phase);
      setLogs(prev => [
        ...prev.slice(-MAX_LOG_ENTRIES + 1),
        {
          type: 'phase_started',
          message: `[${data.runId}] Phase update: ${data.phase} — ${data.status}`,
          timestamp: Date.now(),
          phase: data.phase,
        },
      ]);
    });

    socket.on('phase_completed', (data: { phase: string; result: string }) => {
      setCurrentPhase(null);
      setStreamingToken(null);
      setLogs(prev => [
        ...prev.slice(-MAX_LOG_ENTRIES + 1),
        {
          type: 'phase_completed',
          message: `Phase completed: ${data.phase}`,
          timestamp: Date.now(),
          phase: data.phase,
        },
      ]);
    });

    socket.on('log', (data: any) => {
      const message =
        typeof data === 'string'
          ? data
          : data?.message ?? data?.text ?? JSON.stringify(data);
      setStreamingToken(null);
      setLogs(prev => [
        ...prev.slice(-MAX_LOG_ENTRIES + 1),
        {
          type: 'log',
          message,
          timestamp: Date.now(),
        },
      ]);
    });

    socket.on('agent_token', (data: { agent: string; token: string; timestamp: number }) => {
      setStreamingToken(prev => ({
        agent: data.agent,
        text: prev?.agent === data.agent ? (prev.text + data.token) : data.token,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl]);

  async function handleStart() {
    if (!userRequest.trim() || isRunning) return;
    try {
      const res = await fetch(`${backendUrl}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userRequest, projectId }),
      });
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
    } catch (err: any) {
      setLogs(prev => [
        ...prev,
        {
          type: 'error',
          message: `Failed to start workflow: ${err.message}`,
          timestamp: Date.now(),
        },
      ]);
    }
  }

  async function handleCancel() {
    try {
      await fetch(`${backendUrl}/api/projects/${projectId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Best-effort cancel — ignore network errors
    }
    setIsRunning(false);
    setCurrentPhase(null);
  }

  return (
    <div className="space-y-4">
      {/* Run section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          Run Workflow for {projectName}
        </h3>

        <div className="flex gap-3 items-start">
          <textarea
            value={userRequest}
            onChange={e => setUserRequest(e.target.value)}
            placeholder="Describe what you want the agents to build or improve..."
            className="flex-1 resize-none rounded-xl border border-border-primary bg-white px-4 py-3 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 min-h-[80px] disabled:opacity-50"
            disabled={isRunning}
            rows={3}
          />

          {isRunning ? (
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 self-start"
            >
              <Square className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={!userRequest.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white self-start"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Start
            </Button>
          )}
        </div>

        {/* Status indicator bar */}
        {isRunning && currentPhase && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-700 font-medium">{currentPhase}</span>
            <span className="text-blue-400 ml-auto text-xs">Working...</span>
          </div>
        )}
      </div>

      {/* Live log console */}
      <div className="rounded-xl overflow-hidden border border-gray-800 shadow-lg">
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 font-mono">Live Logs</span>
          {logs.length > 0 && (
            <span className="text-gray-500 text-xs">{logs.length} entries</span>
          )}
          <div className="ml-auto flex items-center gap-3">
            {isRunning && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            )}
            <button
              onClick={() => setLogs([])}
              className="text-gray-500 hover:text-gray-300 text-xs transition-colors disabled:opacity-40"
              disabled={isRunning}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-gray-900 h-80 overflow-y-auto p-4 font-mono text-sm space-y-1">
          {logs.length === 0 && !streamingToken ? (
            <p className="text-gray-600 italic">No logs yet. Start a workflow to see live output here.</p>
          ) : (
            logs.map((entry, i) => (
              <div key={i} className={`flex items-start gap-0 ${logColor(entry.type)} leading-snug`}>
                <span className="text-gray-500 mr-2 text-[10px] tabular-nums flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
          {streamingToken && (
            <div className="text-blue-300 leading-relaxed">
              <span className="text-gray-600 mr-2 text-xs">{new Date().toLocaleTimeString()}</span>
              <span className="text-gray-500 mr-1">[{streamingToken.agent}]</span>
              {streamingToken.text}
              <span className="animate-pulse ml-0.5">▋</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

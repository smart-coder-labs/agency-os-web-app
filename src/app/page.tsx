"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function HomePage() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState('Idle');
  const [phases, setPhases] = useState<Record<string, string>>({});
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_AGENCY_OS_API || 'http://localhost:3002';
    socketRef.current = io(apiUrl);

    socketRef.current.on('log', (data) => {
      setLogs((prev) => [...prev, data]);
    });

    socketRef.current.on('phase_started', (data) => {
      setPhases((prev) => ({ ...prev, [data.phase]: 'Running...' }));
      setStatus(`Running ${data.phase} Phase`);
    });

    socketRef.current.on('phase_completed', (data) => {
      setPhases((prev) => ({ ...prev, [data.phase]: 'Completed' }));
    });

    socketRef.current.on('workflow_started', () => {
      setStatus('Workflow Started');
      setLogs([]);
      setPhases({});
    });

    socketRef.current.on('workflow_completed', (data) => {
      setStatus('Workflow Completed');
    });

    socketRef.current.on('workflow_failed', (data) => {
      setStatus('Workflow Failed');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const runWorkflow = async () => {
    if (!input) return;
    setStatus('Starting...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AGENCY_OS_API || 'http://localhost:3002';
      const res = await fetch(`${apiUrl}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      await res.json();
    } catch (err) {
      console.error(err);
      setStatus('Error connecting to server');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Agency OS Console
          </h1>
          <p className="text-gray-400 mt-2">Status: <span className="text-white font-medium">{status}</span></p>
        </div>
        <div className="flex gap-2">
          {Object.entries(phases).map(([phase, state]) => (
            <div key={phase} className="px-3 py-1 rounded-full bg-gray-800 text-xs border border-gray-700">
              {phase}: <span className={state === 'Completed' ? 'text-green-400' : 'text-blue-400'}>{state}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">New Request</h2>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-40 resize-none"
              placeholder="¿Qué querés construir hoy?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              onClick={runWorkflow}
              disabled={status.includes('Running') || !input}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/40"
            >
              🚀 Run Agency Pipeline
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-[600px] flex flex-col">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-500 font-mono">live_stream.log</span>
            </div>
            
            <div 
              ref={scrollRef}
              className="p-4 font-mono text-sm overflow-y-auto flex-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-800"
            >
              {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-700 italic">
                  Waiting for events...
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={
                    log.level === 'ERROR' ? 'text-red-400' : 
                    log.level === 'WARN' ? 'text-yellow-400' : 
                    log.level === 'DEBUG' ? 'text-gray-500' : 
                    'text-blue-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

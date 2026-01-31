"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, ModalCloseButton } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';

export function AIPlanningWorkflow() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the Agency OS API server
    const apiUrl = process.env.NEXT_PUBLIC_AGENCY_OS_API || 'http://localhost:3002';
    socketRef.current = io(apiUrl);

    socketRef.current.on('workflow_started', (data: any) => {
      toast.info('AI Workflow Started', {
        description: `Processing: ${data.input.substring(0, 50)}...`,
        icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      });
    });

    socketRef.current.on('workflow_completed', (data: any) => {
      setIsLoading(false);
      toast.success('AI Workflow Completed', {
        description: data.result ? `${data.result.substring(0, 150)}...` : 'The strategy and tasks have been generated successfully.',
        icon: <Sparkles className="w-4 h-4 text-green-500" />,
        duration: 10000,
      });
      // Optionally don't close immediately so user can see logs
      // setIsOpen(false); 
      setInput('');
    });

    socketRef.current.on('workflow_failed', (data: any) => {
      setIsLoading(false);
      toast.error('AI Workflow Failed', {
        description: data.error,
      });
    });

    socketRef.current.on('phase_started', (data: any) => {
      toast.message(`Phase Started: ${data.phase}`, {
        description: data.instructions.substring(0, 100),
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AGENCY_OS_API || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }
    } catch (error: any) {
      toast.error('Error', { description: error.message });
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full text-left p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all border border-blue-100/50 group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              Planear con AI
            </div>
            <div className="text-xs text-blue-700/70">Usa el orquestador autónomo para definir tu proyecto</div>
          </div>
          <div className="text-blue-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1">→</div>
        </div>
      </button>

      <Modal position='center' open={isOpen} onOpenChange={setIsOpen} size="xl">
        <ModalCloseButton />
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            AI Agency Planner
          </ModalTitle>
          <ModalDescription>
            Describe qué quieres construir. El CEO, PM, Arquitecto y Diseñador trabajarán juntos para definir la estrategia, historias de usuario y arquitectura.
          </ModalDescription>
        </ModalHeader>

        <ModalContent>
          <form id="ai-planner-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Requerimientos del Proyecto</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ej: Quiero una app de gestión de tareas con un dashboard de analíticas y modo oscuro..."
                className="w-full min-h-[120px] p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
          </form>
        </ModalContent>

        <ModalFooter>
          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            form="ai-planner-form"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isLoading ? 'Orquestando...' : 'Iniciar Planificación'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

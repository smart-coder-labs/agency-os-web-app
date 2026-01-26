"use client";

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  // Stop mermaid from throwing errors to the console or appending them to the body automatically
  suppressErrorRendering: true as any, 
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!ref.current || !chart) return;

      const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
      
      try {
        // Clear previous content
        ref.current.innerHTML = '<div class="flex items-center gap-2 text-slate-400 text-sm py-4"><span class="animate-spin text-lg">⏳</span> Rendering diagram...</div>';
        
        // First, check if the syntax is valid to avoid Mermaid's internal error triggers
        await mermaid.parse(chart);
        
        // Render
        const { svg } = await mermaid.render(id, chart);
        
        if (isMounted && ref.current) {
          ref.current.innerHTML = svg;
          // Clean up any potential garbage left by mermaid in the DOM (sometimes it appends things to the body)
          const garbage = document.getElementById(`d${id}`);
          if (garbage) garbage.remove();
        }
      } catch (error: any) {
        if (!isMounted) return;
        console.error('Mermaid error context:', error);
        
        if (ref.current) {
          ref.current.innerHTML = `
            <div class="p-6 bg-red-50/50 border border-red-100 rounded-xl text-slate-700 text-sm w-full max-w-full overflow-hidden">
              <div class="flex items-center gap-2 mb-4 text-red-600 font-bold uppercase tracking-wider text-[10px]">
                <span class="text-base text-red-500">⚠</span>
                <span>Diagram Syntax Error</span>
              </div>
              <div class="space-y-4">
                <div class="bg-white/80 p-3 rounded-lg border border-red-100/50 shadow-sm overflow-x-auto max-w-full">
                  <pre class="text-red-500 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">${error?.message || 'Check syntax'}</pre>
                </div>
                <div>
                   <div class="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1 ml-1">Source Code</div>
                   <div class="bg-slate-900/5 p-3 rounded-lg overflow-x-auto max-w-full">
                      <pre class="text-[11px] font-mono text-slate-500 opacity-80 leading-tight">${chart}</pre>
                   </div>
                </div>
              </div>
            </div>
          `;
        }
      }
    };

    renderChart();
    return () => { isMounted = false; };
  }, [chart]);

  return <div key={chart} ref={ref} className="mermaid-container flex justify-center my-8 p-1 bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto max-w-full min-h-[100px]" />;
};

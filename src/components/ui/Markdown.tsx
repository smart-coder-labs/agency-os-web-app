"use client"

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';;

import { Mermaid } from './Mermaid';

interface MarkdownProps {
    children: string;
    className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ children, className }) => {
    return (
        <div className={cn("prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none", className)}>
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800" {...props} />,
                    p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-gray-600" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4 text-gray-600" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4 text-gray-600" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-500 my-4 bg-blue-50/50 py-2 rounded-r-lg" {...props} />,
                    table: ({node, ...props}) => (
                        <div className="my-6 w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <table className="w-full border-collapse text-left text-sm" {...props} />
                        </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-gray-50/80 backdrop-blur-sm" {...props} />,
                    th: ({node, ...props}) => (
                        <th className="border-b border-gray-200 p-4 font-bold text-gray-900 uppercase tracking-wider text-[11px]" {...props} />
                    ),
                    td: ({node, ...props}) => (
                        <td className="border-b border-gray-100 p-4 text-gray-600 align-top leading-relaxed" {...props} />
                    ),
                    code: ({node, className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isMermaid = match?.[1] === 'mermaid';
                        const isBlock = !!className;
                        
                        if (isMermaid) {
                            return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                        }

                        if (!isBlock) {
                            return (
                                <code className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono border border-slate-200/50 shadow-sm" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <pre className="bg-slate-50 text-slate-900 p-4 rounded-xl overflow-x-auto my-6 text-sm font-mono border border-slate-200 shadow-sm">
                                <code {...props} className={className}>{children}</code>
                            </pre>
                        );
                    }
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
};

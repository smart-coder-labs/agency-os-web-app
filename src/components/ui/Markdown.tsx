"use client"

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';;

interface MarkdownProps {
    children: string;
    className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ children, className }) => {
    return (
        <div className={cn("prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:underline", className)}>
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800" {...props} />,
                    p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-gray-600" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 my-4" {...props} />,
                    code: ({node, inline, className, children, ...props}: any) => {
                        return inline ? (
                            <code className="bg-gray-100 text-sm px-1 py-0.5 rounded text-pink-600 font-mono" {...props}>{children}</code>
                        ) : (
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono">
                                <code {...props} className={className}>{children}</code>
                            </pre>
                        )
                    }
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
};

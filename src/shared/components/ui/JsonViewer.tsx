'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

// JsonViewerProps is defined below near the component export


type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

const getDataType = (value: any): DataType => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value as DataType;
};

// Optimization constants
const CHUNK_SIZE = 100;
const MAX_STRING_PREVIEW = 500;
const STRING_TRUNCATE_LIMIT = 2000;

interface JsonNodeProps {
    name?: string;
    value: any;
    depth: number;
    isLast: boolean;
    indentSize: number;
    initiallyExpanded: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = React.memo(({
    name,
    value,
    depth,
    isLast,
    indentSize,
    initiallyExpanded,
}) => {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
    const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
    const [showFullString, setShowFullString] = useState(false);
    
    const type = getDataType(value);
    const isExpandable = type === 'object' || type === 'array';
    
    // Efficiently check if object is empty without creating large arrays
    const isEmpty = useMemo(() => {
        if (!isExpandable) return true;
        if (type === 'array') return value.length === 0;
        for (const _ in value) return false;
        return true;
    }, [value, type, isExpandable]);

    const keys = useMemo(() => {
        if (!isExpandable || !isExpanded || isEmpty) return [];
        return Object.keys(value);
    }, [value, isExpandable, isExpanded, isEmpty]);

    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    }, []);

    const handleShowMore = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setVisibleCount(prev => prev + CHUNK_SIZE * 5);
    }, []);

    const renderValue = (val: any, valType: DataType) => {
        switch (valType) {
            case 'string':
                const isLongString = val.length > STRING_TRUNCATE_LIMIT;
                if (isLongString && !showFullString) {
                    return (
                        <span className="text-[#ce9178]">
                            "{val.substring(0, STRING_TRUNCATE_LIMIT)}..."
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowFullString(true); }}
                                className="ml-2 text-blue-400 hover:text-blue-300 text-xs underline cursor-pointer"
                            >
                                Show more ({Math.round(val.length / 1024)} KB)
                            </button>
                        </span>
                    );
                }
                return (
                    <span className="text-[#ce9178]">
                        "{val}"
                        {isLongString && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowFullString(false); }}
                                className="ml-2 text-blue-400 hover:text-blue-300 text-xs underline cursor-pointer"
                            >
                                Show less
                            </button>
                        )}
                    </span>
                );
            case 'number':
                return <span className="text-[#b5cea8]">{val}</span>;
            case 'boolean':
                return <span className="text-[#569cd6]">{val ? 'true' : 'false'}</span>;
            case 'null':
                return <span className="text-[#569cd6]">null</span>;
            default:
                return null;
        }
    };

    const renderPreview = () => {
        if (type === 'array') {
            return <span className="text-gray-400 italic">Array({value.length})</span>;
        }
        // Count keys without creating a full array if possible
        let count = 0;
        if (depth < 2) { // Only do this for shallow previews to avoid lag
            for (const _ in value) {
                count++;
                if (count > 10) break;
            }
        }
        return <span className="text-gray-400 italic">{count > 10 ? '{...}' : '{Object}'}</span>;
    };

    return (
        <div 
            className="font-mono text-sm leading-6"
            style={{ paddingLeft: depth > 0 ? indentSize : 0 }}
        >
            <div className="flex items-start">
                <div className="w-5 h-6 flex items-center justify-center flex-none mr-1">
                    {isExpandable && !isEmpty && (
                        <button
                            onClick={handleToggle}
                            className="text-gray-400 hover:text-gray-200 transition-colors focus:outline-none"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                            )}
                        </button>
                    )}
                </div>

                <div className="flex-1 break-all">
                    {name && (
                        <span className="text-[#9cdcfe] mr-1">
                            "{name}":
                        </span>
                    )}

                    {!isExpandable ? (
                        <>
                            {renderValue(value, type)}
                            {!isLast && <span className="text-gray-400">,</span>}
                        </>
                    ) : (
                        <>
                            <span className="text-[#da70d6]">
                                {type === 'array' ? '[' : '{'}
                            </span>
                            
                            {!isExpanded && !isEmpty && (
                                <>
                                    <button 
                                        onClick={handleToggle}
                                        className="mx-1 hover:bg-white/5 px-1 rounded cursor-pointer"
                                    >
                                        {renderPreview()}
                                    </button>
                                    <span className="text-[#da70d6]">
                                        {type === 'array' ? ']' : '}'}
                                    </span>
                                    {!isLast && <span className="text-gray-400">,</span>}
                                </>
                            )}

                            {isEmpty && (
                                <>
                                    <span className="text-[#da70d6]">
                                        {type === 'array' ? ']' : '}'}
                                    </span>
                                    {!isLast && <span className="text-gray-400">,</span>}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isExpandable && isExpanded && !isEmpty && (
                <div>
                    {keys.slice(0, visibleCount).map((key, index) => (
                        <JsonNode
                            key={key}
                            name={type === 'array' ? undefined : key}
                            value={value[key]}
                            depth={depth + 1}
                            isLast={index === keys.length - 1}
                            indentSize={indentSize}
                            initiallyExpanded={initiallyExpanded}
                        />
                    ))}
                    
                    {visibleCount < keys.length && (
                        <div className="pl-6 py-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleShowMore}
                                className="h-6 text-xs text-blue-400 hover:text-blue-300 hover:bg-white/5"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                Show more ({keys.length - visibleCount} remaining)
                            </Button>
                        </div>
                    )}

                    <div className="pl-6 text-[#da70d6]">
                        {type === 'array' ? ']' : '}'}
                        {!isLast && <span className="text-gray-400">,</span>}
                    </div>
                </div>
            )}
        </div>
    );
});

JsonNode.displayName = 'JsonNode';

export interface JsonViewerProps {
    /** The JSON data to display */
    data?: any;
    /** Optional URL to fetch JSON from (use this for massive files > 50MB) */
    srcUrl?: string;
    /** Whether nested objects/arrays should be expanded by default */
    initiallyExpanded?: boolean;
    /** Number of pixels to indent for each level */
    indentSize?: number;
    /** Optional class name for the container */
    className?: string;
    /** Whether to show the copy button */
    showCopyButton?: boolean;
    /** Maximum height of the container before scrolling */
    maxHeight?: string | number;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
    data: initialData,
    srcUrl,
    initiallyExpanded = false,
    indentSize = 20,
    className,
    showCopyButton = true,
    maxHeight,
}) => {
    const [data, setData] = useState<any>(initialData);
    const [isLoading, setIsLoading] = useState(!!srcUrl && !initialData);
    const [isCopied, setIsCopied] = useState(false);
    const [copyError, setCopyError] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Fetch data if srcUrl is provided
    React.useEffect(() => {
        if (srcUrl && !initialData) {
            const fetchData = async () => {
                setIsLoading(true);
                setLoadError(null);
                try {
                    const response = await fetch(srcUrl);
                    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                    
                    // For very large files, response.json() is safer than response.text() -> JSON.parse()
                    const json = await response.json();
                    setData(json);
                } catch (err: any) {
                    console.error('Error loading JSON:', err);
                    setLoadError(err.message || 'Failed to load large JSON file');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [srcUrl, initialData]);

    const copyToClipboard = async () => {
        if (!data) return;
        setCopyError(null);
        try {
            // Heuristic check: if data is too big, JSON.stringify will fail with ERR_STRING_TOO_LONG
            // We can try to stringify and catch the error
            const jsonString = JSON.stringify(data, null, 2);
            await navigator.clipboard.writeText(jsonString);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err: any) {
            console.error('Failed to copy JSON:', err);
            if (err.message?.includes('string longer than') || err.name === 'RangeError') {
                setCopyError('File is too large to copy to clipboard (> 512MB)');
            } else {
                setCopyError('Failed to copy JSON');
            }
            setTimeout(() => setCopyError(null), 5000);
        }
    };

    return (
        <div className={cn(
            "relative rounded-xl border border-border-primary/50 bg-[#1e1e1e] text-white shadow-sm overflow-hidden min-h-[100px]",
            className
        )}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="text-xs font-medium text-gray-400 flex items-center gap-2">
                    <span>JSON Viewer</span>
                    {isLoading && (
                        <span className="flex items-center gap-1.5 animate-pulse text-blue-400">
                             <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                             Loading massive data...
                        </span>
                    )}
                    {loadError && (
                        <span className="text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {loadError}
                        </span>
                    )}
                    {copyError && (
                        <span className="text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-3 h-3" />
                            {copyError}
                        </span>
                    )}
                </div>
                {showCopyButton && data && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        {isCopied ? (
                            <><Check className="w-3.5 h-3.5 mr-1 text-green-400" /> Copied</>
                        ) : (
                            <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                        )}
                    </Button>
                )}
            </div>
            
            <div 
                className="p-4 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                style={{ maxHeight: maxHeight || '600px' }}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <div className="text-sm font-medium">Processing 1GB+ JSON payload...</div>
                        <div className="text-xs opacity-50">This may take a few seconds depending on your RAM</div>
                    </div>
                ) : data ? (
                    <JsonNode
                        value={data}
                        depth={0}
                        isLast={true}
                        indentSize={indentSize}
                        initiallyExpanded={initiallyExpanded}
                    />
                ) : !loadError && (
                    <div className="text-sm text-gray-500 italic py-4">No data to display</div>
                )}
            </div>
        </div>
    );
};

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Check,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type Column<T> = {
    key: keyof T;
    header: string;
    width?: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
};

export interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    selectable?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    density?: "comfortable" | "compact";
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onSortChange?: (key: keyof T, direction: "asc" | "desc") => void;
}

/* -------------------------------------------------------------------------- */
/*                               ROOT COMPONENT                               */
/* -------------------------------------------------------------------------- */

export function Table<T>({
    columns,
    data,
    selectable = false,
    striped = true,
    hoverable = true,
    density = "comfortable",
    page = 1,
    pageSize = 10,
    onPageChange,
    onSortChange,
}: TableProps<T>) {
    const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
        "asc"
    );
    const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());

    const handleSort = (col: Column<T>) => {
        if (!col.sortable) return;
        const newDirection =
            sortKey === col.key && sortDirection === "asc" ? "desc" : "asc";

        setSortKey(col.key);
        setSortDirection(newDirection);
        onSortChange?.(col.key, newDirection);
    };

    const toggleRow = (index: number) => {
        const copy = new Set(selectedRows);
        copy.has(index) ? copy.delete(index) : copy.add(index);
        setSelectedRows(copy);
    };

    const toggleAll = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map((_, i) => i)));
        }
    };

    const totalPages = Math.ceil(data.length / pageSize);

    const paginatedData = data.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const rowPadding =
        density === "compact" ? "py-2" : "py-3";

    return (
        <div
            className="overflow-hidden rounded-xl"
            style={{ background: '#0D1321', border: '1px solid #1E2D45' }}
        >
            {/* TABLE */}
            <table className="w-full border-collapse text-left">
                <thead style={{ background: '#0A1020', borderBottom: '1px solid #1E2D45' }}>
                    <tr>
                        {selectable && (
                            <th className="w-10 px-4">
                                <Checkbox
                                    checked={selectedRows.size === data.length}
                                    onCheckedChange={toggleAll}
                                />
                            </th>
                        )}

                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className={cn(
                                    "px-4 py-3 select-none whitespace-nowrap",
                                    col.width && `w-[${col.width}]`
                                )}
                                style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                <button
                                    className={cn(
                                        col.sortable
                                            ? "flex items-center gap-1 transition-colors"
                                            : ""
                                    )}
                                    style={col.sortable ? { color: 'inherit' } : undefined}
                                    onClick={() => handleSort(col)}
                                >
                                    {col.header}

                                    {col.sortable && (
                                        <ArrowUpDown
                                            className={cn(
                                                "h-3 w-3 transition-opacity",
                                                sortKey === col.key
                                                    ? "opacity-100"
                                                    : "opacity-40"
                                            )}
                                        />
                                    )}
                                </button>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {paginatedData.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length + (selectable ? 1 : 0)}
                                className="py-10 text-center"
                                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#334155' }}
                            >
                                No results found.
                            </td>
                        </tr>
                    )}

                    {paginatedData.map((row, index) => {
                        const globalIndex = (page - 1) * pageSize + index;

                        return (
                            <motion.tr
                                key={globalIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.18 }}
                                className={cn(
                                    "transition-colors",
                                    hoverable && "cursor-pointer"
                                )}
                                style={{
                                    borderBottom: '1px solid #1E2D45',
                                    background: striped && index % 2 === 1 ? 'rgba(17,24,39,0.5)' : 'transparent',
                                }}
                                onMouseEnter={hoverable ? (e) => { (e.currentTarget as HTMLElement).style.background = '#111827' } : undefined}
                                onMouseLeave={hoverable ? (e) => { (e.currentTarget as HTMLElement).style.background = striped && index % 2 === 1 ? 'rgba(17,24,39,0.5)' : 'transparent' } : undefined}
                            >
                                {selectable && (
                                    <td className="px-4">
                                        <Checkbox
                                            checked={selectedRows.has(globalIndex)}
                                            onCheckedChange={() => toggleRow(globalIndex)}
                                        />
                                    </td>
                                )}

                                {columns.map((col) => (
                                    <td
                                        key={String(col.key)}
                                        className={cn("px-4 text-sm", rowPadding)}
                                        style={{ color: '#F1F5F9' }}
                                    >
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : (row[col.key] as any)}
                                    </td>
                                ))}
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: '#0A1020', borderTop: '1px solid #1E2D45' }}
            >
                <p
                    style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        color: '#334155',
                    }}
                >
                    Page {page} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                    <PaginationButton
                        disabled={page === 1}
                        onClick={() => onPageChange?.(page - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </PaginationButton>
                    <PaginationButton
                        disabled={page === totalPages}
                        onClick={() => onPageChange?.(page + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </PaginationButton>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                               SUB COMPONENTS                               */
/* -------------------------------------------------------------------------- */

function PaginationButton({
    disabled,
    children,
    onClick,
}: {
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "p-2 rounded-lg transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            style={{ border: '1px solid #1E2D45', color: '#475569', background: 'transparent' }}
            onMouseEnter={e => {
                if (!disabled) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#141E2E'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'
                }
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#475569'
            }}
        >
            {children}
        </button>
    );
}

function Checkbox({
    checked,
    onCheckedChange,
    disabled,
}: {
    checked: boolean;
    onCheckedChange?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-disabled={disabled || undefined}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => {
                if (disabled) return;
                onCheckedChange?.();
            }}
            onKeyDown={(event) => {
                if (disabled) return;
                if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    onCheckedChange?.();
                }
            }}
            className={cn(
                "h-4 w-4 rounded-md flex items-center justify-center transition-colors",
                "data-[state=checked]:border-[#6366F1]",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{
                border: '1px solid #243447',
                background: checked ? '#6366F1' : '#0D1321',
            }}
        >
            {checked && <Check className="h-3 w-3 text-white" />}
        </button>
    );
}

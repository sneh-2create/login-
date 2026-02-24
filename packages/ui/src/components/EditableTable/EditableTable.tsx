import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface EditableTableColumn<T = any> {
    /** Column header label */
    header: React.ReactNode;
    /** Width — CSS value e.g. '180px', '10%', or a number (px) */
    width?: string | number;
    /** Custom cell renderer. Receives the row data and its index. */
    cell: (_row: T, _index: number) => React.ReactNode;
}

export interface EditableTableProps<T = any> {
    columns: EditableTableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
}

/**
 * EditableTable — a lightweight table for inline-editable rows.
 *
 * Unlike DataTable (which clips dropdowns via stacking contexts), this component
 * ensures absolutely-positioned children (e.g. SelectSingle dropdowns) are never
 * clipped by setting `overflow: visible` on all containers and using descending
 * z-index per row so upper rows render above lower ones.
 */
export function EditableTable<T = any>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'No data found.',
    className = '',
}: EditableTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
                <RefreshCw size={20} className="animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    return (
        /* Wrapper: rounded card, NO overflow-hidden so dropdowns can escape */
        <div className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm ${className}`}>
            <table
                className="w-full text-sm"
                style={{ borderCollapse: 'collapse', tableLayout: 'auto' }}
            >
                <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
                        {columns.map((col, ci) => (
                            <th
                                key={ci}
                                style={{ width: typeof col.width === 'number' ? `${col.width}px` : col.width }}
                                className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="py-14 text-center text-sm text-[var(--color-muted-foreground)]"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, ri) => (
                            <tr
                                key={ri}
                                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20 transition-colors"
                                /* Higher rows get higher z-index so their dropdowns appear above later rows */
                                style={{ position: 'relative', zIndex: data.length - ri }}
                            >
                                {columns.map((col, ci) => (
                                    <td
                                        key={ci}
                                        style={{
                                            width: typeof col.width === 'number' ? `${col.width}px` : col.width,
                                            position: 'relative',
                                            overflow: 'visible',
                                        }}
                                        className="px-3 py-2"
                                    >
                                        {col.cell(row, ri)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

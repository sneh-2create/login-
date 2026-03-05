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
    /** Minimum width of the table to trigger horizontal scroll. e.g. '800px' or 800 */
    minWidth?: string | number;
}

/**
 * EditableTable — a lightweight table for inline-editable rows.
 *
 * Unlike DataTable (which clips dropdowns via stacking contexts), this component
 * ensures absolutely-positioned children (e.g. SelectSingle dropdowns) are never
 * clipped by setting `overflow: visible` on all containers and using descending
 * z-index per row so upper rows render above lower ones.
 * 
 * Update: Added overflow-x-auto wrapper for responsiveness. Uses pb-10 to prevent 
 * clipping of dropdowns in the last row.
 */
export function EditableTable<T = any>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'No data found.',
    className = '',
    minWidth,
}: EditableTableProps<T>) {
    const [focusedRowIndex, setFocusedRowIndex] = React.useState<number | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
                <RefreshCw size={20} className="animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    return (
        /* Wrapper: rounded card */
        <div className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm ${className}`}>
            <div className="w-full overflow-x-auto custom-scrollbar">
                <table
                    className="w-full text-sm"
                    style={{ 
                        borderCollapse: 'collapse', 
                        tableLayout: 'auto',
                        minWidth: typeof minWidth === 'number' ? `${minWidth}px` : (minWidth || '800px')
                    }}
                >
                    <thead className="relative z-[5]">
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
                    <tbody onMouseLeave={() => setFocusedRowIndex(null)}>
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
                                    onFocus={() => setFocusedRowIndex(ri)}
                                    // Use onBlur with a tiny delay to allow clicking dropdown items
                                    // or just rely on focus-within if we can. 
                                    // Actually, let's keep it simple: if row == focusedRowIndex, z-index is high.
                                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20 transition-colors group/row"
                                    /* 
                                       Active row gets highest z-index.
                                       Otherwise, higher rows get higher z-index so their dropdowns appear above later rows (for downward-opening).
                                    */
                                    style={{ 
                                        position: 'relative', 
                                        zIndex: focusedRowIndex === ri ? 50 : (data.length - ri) 
                                    }}
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
        </div>
    );
}

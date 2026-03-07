import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { SelectSingle } from '../Atoms/SelectSingle';
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_ITEMS_PER_PAGE_OPTIONS } from '@od-erp/constants';

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
    showPagination?: boolean;
    itemsPerPageOptions?: number[];
    initialItemsPerPage?: number;
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
    showPagination = true,
    itemsPerPageOptions = DEFAULT_ITEMS_PER_PAGE_OPTIONS,
    initialItemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: EditableTableProps<T>) {
    const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialItemsPerPage);

    // Reset page index if data length changes drastically
    useEffect(() => {
        const totalPages = Math.ceil(data.length / pageSize);
        if (pageIndex >= totalPages && totalPages > 0) {
            setPageIndex(totalPages - 1);
        }
    }, [data.length, pageSize, pageIndex]);

    const displayData = showPagination 
        ? data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) 
        : data;

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
                            displayData.map((row, localIndex) => {
                                const globalIndex = showPagination ? (pageIndex * pageSize) + localIndex : localIndex;
                                return (
                                <tr
                                    key={globalIndex}
                                    onFocus={() => setFocusedRowIndex(globalIndex)}
                                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20 transition-colors group/row"
                                    style={{ 
                                        position: 'relative', 
                                        zIndex: focusedRowIndex === globalIndex ? 50 : (displayData.length - localIndex) 
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
                                            {col.cell(row, globalIndex)}
                                        </td>
                                    ))}
                                </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            {showPagination && data.length > 0 && (
                <div className="w-full px-3 py-2 box-border flex justify-between items-center border-t border-[var(--color-border)] bg-[var(--color-card)] flex-shrink-0 rounded-b-xl">
                    <div className="flex items-center gap-2">
                        <span className="font-sans text-sm text-[var(--color-muted-foreground)] whitespace-nowrap">
                            Items per page:
                        </span>
                        <div className="flex-shrink-0">
                            <SelectSingle
                                value={pageSize}
                                onChange={(val) => {
                                    setPageSize(Number(val));
                                    setPageIndex(0);
                                }}
                                options={itemsPerPageOptions.map((option) => ({
                                    label: option.toString(),
                                    value: option,
                                }))}
                                className="h-8 min-h-0 py-0 pl-3 pr-10 text-sm min-w-[60px]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-sans text-sm text-[var(--color-muted-foreground)] whitespace-nowrap">
                            {(pageIndex * pageSize) + 1}–{Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length}
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-md bg-[var(--color-background)] cursor-pointer hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                                disabled={pageIndex === 0}
                                type="button"
                            >
                                <ChevronLeft className="w-4 h-4 text-[var(--color-muted-foreground)]" strokeWidth={1.5} />
                            </button>
                            <button
                                className="w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-md bg-[var(--color-background)] cursor-pointer hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setPageIndex(p => p + 1)}
                                disabled={(pageIndex + 1) * pageSize >= data.length}
                                type="button"
                            >
                                <ChevronRight className="w-4 h-4 text-[var(--color-muted-foreground)]" strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

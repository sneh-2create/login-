import React, { useState, useMemo, useLayoutEffect, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    SortingState,
    ColumnDef,
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ExtendedColumnMeta, BaseDataTableProps } from '@od-erp/types';
import { Dropdown } from '../Atoms/Dropdown';
import {
    FONT_WEIGHT_NUMERIC_MAP,
    FONT_WEIGHT_STRING_MAP,
    DEFAULT_FONT_WEIGHT,

    DEFAULT_ITEMS_PER_PAGE,
    DEFAULT_ITEMS_PER_PAGE_OPTIONS,
    DEFAULT_SEARCH_PLACEHOLDER,
} from '@od-erp/constants';

export interface DataTableProps<TData, TValue> extends BaseDataTableProps {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    maxHeight: _maxHeight,
    isLoading,
    showSearch = true,
    searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
    onSearch,
    showPagination = true,
    itemsPerPageOptions = DEFAULT_ITEMS_PER_PAGE_OPTIONS,
    initialItemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    containerClassName = '',
    enableSorting = true,
    manualPagination = false,
    pageCount,
    rowCount,
    onPaginationChange,
    searchByOptions,
    searchByValue,
    onSearchByChange,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: initialItemsPerPage,
    });

    // The card uses position:sticky once it scrolls behind the fixed header stack.
    // PageToolbar publishes the exact bottom-Y of the sticky bar via
    // --table-sticky-top on <html>.  DataTable reads it here — no DOM-query
    // race conditions, works regardless of the GlobalHeader's HTML markup.
    const cardRef = useRef<HTMLDivElement>(null);
    const [cardStyle, setCardStyle] = React.useState<React.CSSProperties>({});

    useLayoutEffect(() => {
        const BOTTOM_GAP = 16;

        /** Read the CSS variable set by PageToolbar (px, unitless number string). */
        const getStickyOffset = (): number => {
            const raw = getComputedStyle(document.documentElement)
                .getPropertyValue('--table-sticky-top')
                .trim();
            const val = parseFloat(raw);
            return isNaN(val) ? 0 : Math.max(val, 0);
        };

        /** Walk up ancestors to find the element that actually scrolls. */
        const findScrollParent = (el: HTMLElement): HTMLElement | null => {
            let node = el.parentElement;
            while (node && node !== document.body) {
                const { overflowY } = window.getComputedStyle(node);
                if (overflowY === 'auto' || overflowY === 'scroll') return node;
                node = node.parentElement;
            }
            return null;
        };

        const compute = () => {
            const el = cardRef.current;
            if (!el) return;

            const stickyOffset = getStickyOffset();

            // ── fast path: already pinned at the correct offset, nothing to do ──
            // (avoids the style clear/restore cycle during every tbody scroll event)
            if (
                el.style.position === 'sticky' &&
                el.style.top === `${stickyOffset}px` &&
                stickyOffset > 0
            ) {
                // Re-check height in case the viewport resized
                const h = Math.max(window.innerHeight - stickyOffset - BOTTOM_GAP, 200);
                setCardStyle(prev =>
                    prev.position === 'sticky' && prev.height === `${h}px` && prev.top === `${stickyOffset}px`
                        ? prev
                        : { position: 'sticky', top: `${stickyOffset}px`, height: `${h}px` }
                );
                return;
            }

            // Temporarily clear inline styles to read the natural-flow position
            const savedPos = el.style.position;
            const savedTop = el.style.top;
            const savedH   = el.style.height;
            el.style.position = '';
            el.style.top      = '';
            el.style.height   = '';

            const rect = el.getBoundingClientRect();

            el.style.position = savedPos;
            el.style.top      = savedTop;
            el.style.height   = savedH;

            if (stickyOffset > 0 && rect.top <= stickyOffset + 1) {
                // Card has scrolled into the fixed-header zone → pin + fill viewport
                const h = Math.max(window.innerHeight - stickyOffset - BOTTOM_GAP, 200);
                setCardStyle(prev =>
                    prev.position === 'sticky' && prev.height === `${h}px` && prev.top === `${stickyOffset}px`
                        ? prev
                        : { position: 'sticky', top: `${stickyOffset}px`, height: `${h}px` }
                );
            } else {
                // Natural flow — no height constraint, let the page scroll freely
                setCardStyle(prev => (Object.keys(prev).length === 0 ? prev : {}));
            }
        };

        // Scroll inside the card's own tbody should NOT trigger a recompute —
        // doing so clears the card height momentarily and kills the scroll momentum.
        const handleScroll = (e: Event) => {
            const el = cardRef.current;
            if (el && e.target instanceof Node && el.contains(e.target)) return;
            compute();
        };

        compute();

        window.addEventListener('resize', compute, { passive: true });
        document.addEventListener('scroll', handleScroll, { passive: true, capture: true });

        const scrollParent = findScrollParent(cardRef.current!);
        scrollParent?.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('resize', compute);
            document.removeEventListener('scroll', handleScroll, { capture: true });
            scrollParent?.removeEventListener('scroll', handleScroll);
        };
    }, [data, columns]);



    // Handle external pagination updates
    const handlePaginationChange = (updater: any) => {
        // useReactTable passes an updater function or value
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
        setPagination(newPagination);
        if (onPaginationChange) {
            onPaginationChange(newPagination);
        }
    };

    // Filter data based on search query
    const filteredData = useMemo(() => {
        // If manualPagination is on, we assume data is already filtered/paginated
        if (manualPagination || !searchQuery) {
            return data;
        }
        if (onSearch) {
            return data;
        }
        return data.filter((row) => {
            return Object.values(row as Record<string, unknown>).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [data, searchQuery, onSearch, manualPagination]);

    // Calculate page count for manual pagination if rowCount provided
    const derivedPageCount = pageCount ?? (
        (rowCount !== undefined && pagination.pageSize > 0)
            ? Math.ceil(rowCount / pagination.pageSize)
            : -1
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        pageCount: derivedPageCount,
        rowCount: rowCount,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: handlePaginationChange,
        manualPagination: manualPagination,
        state: {
            sorting,
            pagination,
        },
        // debugTable: true,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) {
            onSearch(value);
        }
        table.setPageIndex(0);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        const newPagination = {
            pageIndex: 0,
            pageSize: value,
        };
        setPagination(newPagination);
        if (onPaginationChange) {
            onPaginationChange(newPagination);
        }
    };

    const handlePrevPage = () => {
        table.previousPage();
    };

    const handleNextPage = () => {
        table.nextPage();
    };

    const getCellClassName = (column: ColumnDef<TData, TValue>) => {
        const meta = column.meta as ExtendedColumnMeta<TData> | undefined;
        // Default matches the clean, spacious look
        const baseClasses = 'px-6 py-4 font-sans text-sm leading-5 tracking-tight align-middle border-b border-[var(--color-border)] transition-colors';
        const alignClass = meta?.align ? (meta.align === 'center' ? 'text-center' : meta.align === 'right' ? 'text-right' : 'text-left') : 'text-left';

        // Determine font weight - Headers are bold in screenshot, body name is bold
        let fontWeightClass = '';
        let textColorClass = '';

        if (meta?.isBold) {
            fontWeightClass = 'font-bold';
            textColorClass = 'text-[var(--color-foreground)]';
        } else if (meta?.fontWeight) {
            // ... existing logic fallback ...
            if (typeof meta.fontWeight === 'number') {
                fontWeightClass = FONT_WEIGHT_NUMERIC_MAP[meta.fontWeight] || DEFAULT_FONT_WEIGHT;
            } else {
                fontWeightClass = FONT_WEIGHT_STRING_MAP[meta.fontWeight] || DEFAULT_FONT_WEIGHT;
            }
            textColorClass = 'text-[var(--color-muted-foreground)]';
        } else {
            fontWeightClass = 'font-normal';
            textColorClass = 'text-[var(--color-muted-foreground)]';
        }

        // Allow overriding text color via meta.textColor
        if (meta?.textColor) {
            if (meta.textColor.startsWith('text-')) {
                textColorClass = meta.textColor;
            } else if (meta.textColor.startsWith('#')) {
                // handled in style
            }
        }

        let finalClasses = `${baseClasses} ${alignClass} ${fontWeightClass} ${textColorClass}`;
        if (meta?.className) finalClasses += ` ${meta.className}`;

        return finalClasses;
    };

    const getCellStyle = (column: ColumnDef<TData, TValue>): React.CSSProperties => {
        const meta = column.meta as ExtendedColumnMeta<TData> | undefined;
        const style: React.CSSProperties = {};

        if (meta?.width) {
            style.width = `${meta.width}px`;
            style.minWidth = `${meta.width}px`;
        }

        if (meta?.textColor && !meta.textColor.startsWith('text-')) {
            style.color = meta.textColor;
        }

        return style;
    };

    const getHeaderStyle = (column: ColumnDef<TData, TValue>): React.CSSProperties => {
        const meta = column.meta as ExtendedColumnMeta<TData> | undefined;
        return meta?.width ? { width: `${meta.width}px`, minWidth: `${meta.width}px` } : {};
    };

    // Calculate pagination stats
    const currentPageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    // For manual pagination, utilize rowCount if available, otherwise filtered rows length
    const totalRows = manualPagination ? (rowCount || data.length) : table.getFilteredRowModel().rows.length;

    const startItem = totalRows > 0 ? (currentPageIndex * pageSize) + 1 : 0;
    const endItem = Math.min((currentPageIndex + 1) * pageSize, totalRows);


    return (
        <div className={`w-full flex justify-center items-start p-0 font-sans ${containerClassName}`}>
            <div
                ref={cardRef}
                className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col"
                style={Object.keys(cardStyle).length ? cardStyle : undefined}
            >
                {/* Search Section — sticky at top */}
                {showSearch && (
                    <div className="w-full min-h-16 p-3 box-border flex items-center gap-3 border-b border-[var(--color-border)] flex-shrink-0 bg-[var(--color-card)]">
                        {/* Search By Dropdown (optional) */}
                        {searchByOptions && searchByOptions.length > 0 && (
                            <div className="w-48 flex-shrink-0">
                                <Dropdown
                                    value={searchByValue || ''}
                                    onChange={(val) => onSearchByChange?.(val as string)}
                                    options={searchByOptions}
                                    placeholder="Search By"
                                />
                            </div>
                        )}

                        {/* Search Input */}
                        <div className="flex-1 h-10 relative flex items-center gap-0">
                            <input
                                type="text"
                                className="w-full h-10 px-4 pr-10 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] font-sans text-sm font-normal leading-5 tracking-ui-tight text-[var(--color-foreground)] outline-none box-border placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)]"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none z-10">
                                <Search className="w-4 h-4 text-[var(--color-muted-foreground)]" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Section — scrollable body */}
                <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
                    <table className="w-full border-collapse bg-[var(--color-card)]">
                        <thead className="bg-[var(--color-muted)] sticky top-0 z-10">
                            <tr className="h-[50px]">
                                {table.getHeaderGroups().map((headerGroup) =>
                                    headerGroup.headers.map((header) => {
                                        const column = header.column.columnDef;
                                        return (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-center font-sans text-xs font-bold tracking-wide text-[var(--color-foreground)] border-b border-[var(--color-border)] whitespace-nowrap"
                                                style={getHeaderStyle(column)}
                                                onClick={enableSorting && header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                            >
                                                <div className={`flex items-center justify-center gap-2 ${enableSorting && header.column.getCanSort() ? 'cursor-pointer hover:text-[var(--color-primary)]' : ''}`}>
                                                    {flexRender(column.header, header.getContext())}
                                                    {enableSorting && header.column.getCanSort() && (
                                                        <span className="ml-1">
                                                            {{
                                                                asc: <ArrowUp className="h-3 w-3 text-[var(--color-muted-foreground)]" />,
                                                                desc: <ArrowDown className="h-3 w-3 text-[var(--color-muted-foreground)]" />,
                                                            }[header.column.getIsSorted() as string] ?? (
                                                                    <ArrowUpDown className="h-3 w-3 text-[var(--color-muted-foreground)]" />
                                                                )}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-3 py-8 text-center font-sans text-sm text-[var(--color-muted-foreground)] align-middle"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="min-h-[48px] border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-muted)] transition-colors group">
                                        {row.getVisibleCells().map((cell) => {
                                            const column = cell.column.columnDef;
                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={getCellClassName(column)}
                                                    style={getCellStyle(column)}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-3 py-3 text-center font-sans text-sm text-[var(--color-muted-foreground)] align-middle"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section — sticky at bottom */}
                {showPagination && (
                    <div className="w-full px-3 py-2 box-border flex justify-between items-center border-t border-[var(--color-border)] bg-[var(--color-card)] flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="font-sans text-sm text-[var(--color-muted-foreground)]">
                                Items per page:
                            </span>
                            <div className="relative">
                                <select
                                    className="h-8 pl-3 pr-7 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-sm text-[var(--color-foreground)] cursor-pointer outline-none focus:border-[var(--color-primary)] appearance-none min-w-[60px]"
                                    style={{
                                        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22 fill=%22none%22%3E%3Cpath d=%22M1 1L5 5L9 1%22 stroke=%22%236B7280%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 8px center'
                                    }}
                                    value={pageSize}
                                    onChange={handleItemsPerPageChange}
                                >
                                    {itemsPerPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-sans text-sm text-[var(--color-muted-foreground)]">
                                {startItem} – {endItem} of {totalRows}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-md bg-[var(--color-background)] cursor-pointer hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    onClick={handlePrevPage}
                                    disabled={currentPageIndex === 0}
                                >
                                    <ChevronLeft className="w-4 h-4 text-[var(--color-muted-foreground)]" strokeWidth={1.5} />
                                </button>
                                <button
                                    className="w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-md bg-[var(--color-background)] cursor-pointer hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    onClick={handleNextPage}
                                    disabled={endItem >= totalRows}
                                >
                                    <ChevronRight className="w-4 h-4 text-[var(--color-muted-foreground)]" strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

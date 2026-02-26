import React, { useState, useMemo, useRef } from 'react';
import { getScrollParent } from '../../utils';
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
import { ExtendedColumnMeta, DataTableProps } from '@od-erp/types';
import {
    FONT_WEIGHT_NUMERIC_MAP,
    FONT_WEIGHT_STRING_MAP,
    DEFAULT_FONT_WEIGHT,

    DEFAULT_ITEMS_PER_PAGE,
    DEFAULT_ITEMS_PER_PAGE_OPTIONS,
    DEFAULT_SEARCH_PLACEHOLDER,
} from '@od-erp/constants';
import { SelectSingle } from '../Atoms/SelectSingle';


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

    const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
    React.useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

    const cardRef = useRef<HTMLDivElement>(null);
    const [isStuck, setIsStuck] = useState(false);

    // IntersectionObserver only to detect when the table is sticky for shadow feedback.
    // The actual stickiness is handled by CSS position: sticky.
    React.useEffect(() => {
        const parent = getScrollParent(cardRef.current);
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                // We consider it "stuck" when the entry is not fully visible at the top
                // due to the sticky offset. We use a small 5px buffer.
                const raw = getComputedStyle(document.documentElement).getPropertyValue('--table-sticky-top-px').trim();
                const stickyTop = parseFloat(raw) || 140;
                setIsStuck(entry.boundingClientRect.top <= stickyTop + 5);
            },
            { 
                threshold: [0.99, 1],
                root: parent === document.documentElement ? null : parent
            }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [data]);



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

    const handleItemsPerPageChange = (value: string | number | (string | number)[]) => {
        if (Array.isArray(value)) return;
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        const newPagination = {
            pageIndex: 0,
            pageSize: numValue,
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
        <div className={`w-full flex justify-center items-start p-0 font-sans relative ${containerClassName}`}>
            <div
                ref={cardRef}
                className={`w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl flex flex-col sticky z-20 transition-shadow duration-300 ${isStuck ? 'shadow-lg border-opacity-50' : ''}`}
                style={{
                    top: 'var(--table-sticky-top-px, 0px)',
                    maxHeight: 'calc(100vh - var(--table-sticky-top-px, 0px) - 16px)',
                }}
            >
                {/* Search Section — sticky at top */}
                {showSearch && (
                    <div className="w-full min-h-16 p-3 box-border flex items-center gap-3 border-b border-[var(--color-border)] flex-shrink-0 bg-[var(--color-card)] rounded-t-xl">
                        {/* Search By Dropdown (optional) */}
                        {searchByOptions && searchByOptions.length > 0 && (
                            <div className="w-48 flex-shrink-0">
                                <SelectSingle
                                    value={searchByValue || ''}
                                    onChange={(val) => onSearchByChange?.(val as string)}
                                    options={searchByOptions as any}
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
                    <div className={`w-full ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2'} box-border flex justify-between items-center border-t border-[var(--color-border)] bg-[var(--color-card)] flex-shrink-0 rounded-b-xl`}>
                        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
                            <span className={`font-sans ${isMobile ? 'text-[12px]' : 'text-sm'} text-[var(--color-muted-foreground)] whitespace-nowrap`}>
                                {isMobile ? 'Items:' : 'Items per page:'}
                            </span>
                            <div className="flex-shrink-0">
                                <SelectSingle
                                    value={pageSize}
                                    onChange={handleItemsPerPageChange}
                                    options={itemsPerPageOptions.map((option) => ({
                                        label: option.toString(),
                                        value: option,
                                    }))}
                                    className={isMobile ? "h-7 min-h-0 py-0 pl-2 pr-8 text-xs min-w-[50px]" : "h-8 min-h-0 py-0 pl-3 pr-10 text-sm min-w-[60px]"}
                                />
                            </div>
                        </div>

                        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
                            <span className={`font-sans ${isMobile ? 'text-[12px]' : 'text-sm'} text-[var(--color-muted-foreground)] whitespace-nowrap`}>
                                {startItem}–{endItem} of {totalRows}
                            </span>
                            <div className={`flex ${isMobile ? 'gap-1' : 'gap-2'}`}>
                                <button
                                    className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} flex items-center justify-center border border-[var(--color-border)] rounded-md bg-[var(--color-background)] cursor-pointer hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                    onClick={handlePrevPage}
                                    disabled={currentPageIndex === 0}
                                >
                                    <ChevronLeft className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[var(--color-muted-foreground)]`} strokeWidth={1.5} />
                                </button>
                                <button
                                    className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} flex items-center justify-center border border-[var(--color-border)] rounded-md bg-[var(--color-background)] cursor-pointer hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                    onClick={handleNextPage}
                                    disabled={endItem >= totalRows}
                                >
                                    <ChevronRight className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[var(--color-muted-foreground)]`} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

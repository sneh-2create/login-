import React, { useState, useMemo } from 'react';
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
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { ExtendedColumnMeta, BaseDataTableProps, StatusBadgeProps } from '@od-erp/types';
import {
    FONT_WEIGHT_NUMERIC_MAP,
    FONT_WEIGHT_STRING_MAP,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_TEXT_COLOR,
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
    maxHeight,
    isLoading,
    showSearch = true,
    searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
    onSearch,
    showPagination = true,
    itemsPerPageOptions = DEFAULT_ITEMS_PER_PAGE_OPTIONS,
    initialItemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    containerClassName = '',
    enableSorting = true,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: initialItemsPerPage,
    });

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) {
            return data;
        }
        // If onSearch is provided, let parent handle filtering
        if (onSearch) {
            return data;
        }
        // Otherwise, do basic client-side filtering
        return data.filter((row) => {
            return Object.values(row as Record<string, unknown>).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [data, searchQuery, onSearch]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        initialState: {
            pagination: {
                pageSize: initialItemsPerPage,
            },
        },
        state: {
            sorting,
            pagination,
        },
        manualPagination: false,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) {
            onSearch(value);
        }
        // Reset to first page on search
        table.setPageIndex(0);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setPagination({
            pageIndex: 0,
            pageSize: value,
        });
    };

    const handlePrevPage = () => {
        table.previousPage();
    };

    const handleNextPage = () => {
        table.nextPage();
    };

    const getCellClassName = (column: ColumnDef<TData, TValue>) => {
        const meta = column.meta as ExtendedColumnMeta<TData> | undefined;
        if (!meta) {
            return `px-3 py-3 text-center font-sans text-sm leading-[16.943px] tracking-ui-tight align-middle box-border ${DEFAULT_TEXT_COLOR}`;
        }

        const baseClasses = 'px-3 py-3 text-center font-sans text-sm leading-[16.943px] tracking-ui-tight align-middle box-border';
        const alignClass = meta.align === 'left' ? 'text-left' : meta.align === 'right' ? 'text-right' : 'text-center';

        // Determine font weight
        let fontWeightClass = DEFAULT_FONT_WEIGHT;
        if (meta.isBold) {
            fontWeightClass = 'font-semibold';
        } else if (meta.fontWeight) {
            if (typeof meta.fontWeight === 'number') {
                fontWeightClass = FONT_WEIGHT_NUMERIC_MAP[meta.fontWeight] || DEFAULT_FONT_WEIGHT;
            } else {
                fontWeightClass = FONT_WEIGHT_STRING_MAP[meta.fontWeight] || DEFAULT_FONT_WEIGHT;
            }
        }

        // Determine text color
        let colorClass = DEFAULT_TEXT_COLOR;
        if (meta.textColor) {
            if (meta.textColor.startsWith('text-')) {
                colorClass = meta.textColor;
            } else {
                // Will be handled via inline style
                colorClass = '';
            }
        }

        let finalClasses = `${baseClasses} ${alignClass} ${fontWeightClass}`;
        if (colorClass) {
            finalClasses += ` ${colorClass}`;
        }
        if (meta.className) {
            finalClasses += ` ${meta.className}`;
        }

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
        const style: React.CSSProperties = {};

        if (meta?.width) {
            style.width = `${meta.width}px`;
            style.minWidth = `${meta.width}px`;
        }

        return style;
    };

    // Render cell content - check if it's a StatusBadge
    const renderCellContent = (cell: any) => {
        const value = cell.getValue();

        // Check if value is a StatusBadge object
        if (value && typeof value === 'object' && 'label' in value && 'variant' in value) {
            const badge = value as StatusBadgeProps;
            return <StatusBadge {...badge} />;
        }

        // Use default rendering
        return flexRender(cell.column.columnDef.cell, cell.getContext());
    };

    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalItems = table.getFilteredRowModel().rows.length;
    const currentPageSize = table.getState().pagination.pageSize;
    const startItem = totalItems > 0 ? (currentPage - 1) * currentPageSize + 1 : 0;
    const endItem = Math.min(currentPage * currentPageSize, totalItems);

    return (
        <div className={`w-full flex justify-center items-start p-0 font-sans ${containerClassName}`}>
            <div className={`w-full bg-white border border-ui-gray-100 rounded-xl overflow-hidden flex flex-col ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
                {/* Search Section */}
                {showSearch && (
                    <div className="w-full h-16 p-3 box-border flex items-center border-b border-ui-gray-200">
                        <div className="w-full h-10 relative flex items-center gap-0">
                            <input
                                type="text"
                                className="w-full h-10 px-4 pr-10 border border-ui-gray-200 rounded-lg bg-white font-sans text-sm font-normal leading-5 tracking-ui-tight text-ui-gray-800 outline-none box-border placeholder:text-ui-placeholder focus:border-blue-500"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none z-10">
                                <Search className="w-4 h-4 text-ui-gray-400" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="w-full overflow-x-auto overflow-y-auto" style={maxHeight ? { maxHeight: maxHeight } : {}}>
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-ui-gray-50">
                            <tr className="h-[50px]">
                                {table.getHeaderGroups().map((headerGroup) =>
                                    headerGroup.headers.map((header) => {
                                        const column = header.column.columnDef;
                                        return (
                                            <th
                                                key={header.id}
                                                className="h-[50px] px-3 py-[18px] text-center font-sans text-[11px] font-bold leading-[13.3125px] tracking-ui-wide text-ui-gray-600 border-b border-ui-gray-200 align-middle box-border"
                                                style={getHeaderStyle(column)}
                                                onClick={enableSorting && header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                            >
                                                <div className={`flex items-center gap-2 ${enableSorting && header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}>
                                                    {flexRender(column.header, header.getContext())}
                                                    {enableSorting && header.column.getCanSort() && (
                                                        <span className="ml-1">
                                                            {{
                                                                asc: <ArrowUp className="h-3 w-3 text-ui-gray-400" />,
                                                                desc: <ArrowDown className="h-3 w-3 text-ui-gray-400" />,
                                                            }[header.column.getIsSorted() as string] ?? (
                                                                    <ArrowUpDown className="h-3 w-3 text-ui-gray-400" />
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
                                        className="px-3 py-8 text-center font-sans text-sm text-ui-gray-600 align-middle"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="min-h-[48px] border-b border-ui-gray-100 last:border-b-0 hover:bg-ui-gray-50 transition-colors">
                                        {row.getVisibleCells().map((cell) => {
                                            const column = cell.column.columnDef;
                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={getCellClassName(column)}
                                                    style={getCellStyle(column)}
                                                >
                                                    {renderCellContent(cell)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-3 py-3 text-center font-sans text-sm text-ui-gray-600 align-middle"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                {showPagination && (
                    <div className="w-full h-[65px] p-4 box-border flex justify-between items-center border-t border-ui-gray-100 bg-white">
                        <div className="flex items-center gap-3 h-8">
                            <span className="font-sans text-sm font-normal leading-5 tracking-ui-tight text-ui-gray-600">
                                Items per page:
                            </span>
                            <div className="relative">
                                <select
                                    className="w-[70px] h-8 px-3 pr-7 border border-ui-gray-200 rounded bg-white font-sans text-sm font-normal leading-[16.943px] tracking-ui-tight text-ui-gray-700 appearance-none cursor-pointer outline-none box-border bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20viewBox%3D%270%200%2010%206%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%23374151%27%20stroke-width%3D%271.5%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] focus:border-blue-500"
                                    value={currentPageSize}
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
                        <div className="flex items-center gap-3 h-8">
                            <span className="font-sans text-sm font-normal leading-5 tracking-ui-tight text-ui-gray-600">
                                {startItem} – {endItem} of {totalItems}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    className="w-8 h-8 flex items-center justify-center border border-ui-gray-200 rounded bg-white cursor-pointer outline-none p-0 box-border hover:bg-ui-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handlePrevPage}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronLeft className="w-3 h-3 text-ui-gray-400" strokeWidth={1.5} />
                                </button>
                                <button
                                    className="w-8 h-8 flex items-center justify-center border border-ui-gray-200 rounded bg-white cursor-pointer outline-none p-0 box-border hover:bg-ui-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleNextPage}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronRight className="w-3 h-3 text-ui-gray-400" strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

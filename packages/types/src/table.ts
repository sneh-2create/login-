// Base column meta interface (matching @tanstack/react-table's ColumnMeta structure)
export interface BaseColumnMeta {
    [key: string]: unknown;
}

// Extended column meta for dynamic styling
// TData is kept for type compatibility with @tanstack/react-table's ColumnMeta
// @ts-ignore - TData is intentionally unused but kept for type compatibility
export interface ExtendedColumnMeta<_TData = unknown> extends BaseColumnMeta {
    width?: number;
    align?: 'left' | 'center' | 'right';
    fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
    textColor?: string;
    isBold?: boolean;
    className?: string;
}

// Status Badge Types
export interface StatusBadgeProps {
    label: string;
    variant: 'paid' | 'pending' | 'failed' | 'custom';
    customBgColor?: string;
    customTextColor?: string;
    className?: string;
}

// Data Table Props (generic, will be extended by components)
export interface BaseDataTableProps {
    maxHeight?: string;
    isLoading?: boolean;
    // Search functionality
    showSearch?: boolean;
    searchPlaceholder?: string;
    onSearch?: (_query: string) => void;
    // Pagination
    showPagination?: boolean;
    itemsPerPageOptions?: number[];
    initialItemsPerPage?: number;
    manualPagination?: boolean;
    pageCount?: number;
    rowCount?: number;
    onPaginationChange?: (_pagination: { pageIndex: number; pageSize: number }) => void;
    // Container styling
    containerClassName?: string;
    // Enable sorting
    enableSorting?: boolean;
}

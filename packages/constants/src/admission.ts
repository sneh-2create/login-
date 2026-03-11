// Admission Module Constants

// Search By Options
export const ADMISSION_SEARCH_BY_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'Application Number', value: 'applicationNumber' },
    { label: 'Father Name', value: 'fatherName' },
    { label: 'Phone', value: 'phone' },
    { label: 'Source Id', value: 'sourceId' }
] as const;

export const ADMISSION_LEADS_SEARCH_BY_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'Phone', value: 'phone' },
    { label: 'Application Number', value: 'applicationNumber' }
] as const;

// Pagination Options
export const ADMISSION_PAGE_SIZE_OPTIONS = [10, 25, 100] as const;
export const DEFAULT_ADMISSION_PAGE_SIZE = 10;

// Template Report Type
export const ADMISSION_REPORT_TYPE = 'admissionApplicationReport' as const;

// Fixed Table Columns (always present in table)
export const ADMISSION_FIXED_COLUMNS = ['position', 'action', 'currentStage'] as const;

// Date Filter Shortcuts
export const DATE_FILTER_SHORTCUTS = {
    CURRENT_DATE: 'currentDate',
    LAST_WEEK: 'lastWeek',
    LAST_MONTH: 'lastMonth',
    THIS_YEAR: 'thisYear'
} as const;

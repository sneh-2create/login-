import type { ExcelTemplate, TableHead } from '@od-erp/types';

export interface ExcelHeadOption {
    name: string;
    value: string;
}

export interface ExcelFilterOption {
    name: string;
    value: string;
}

export interface ExcelSortByOption {
    name: string;
    value: string;
}

export interface ExcelFilterValueOption {
    label: string;
    value: string;
}

export interface ExcelTemplateEditDrawerProps {
    open: boolean;
    onClose: () => void;
    template: ExcelTemplate;
    /** Display name shown in the drawer header (e.g. "Daily Collection Report") */
    reportDisplayName?: string;

    // Report-specific configuration — passed from the parent page
    availableHeads: ExcelHeadOption[];
    availableFilters: ExcelFilterOption[];
    sortByOptions: ExcelSortByOption[];
    defaultHeads: TableHead[];

    /** Filter keys that accept multiple values (e.g. ['course']) */
    multiValueFilterKeys?: string[];
    /** Filter keys that use date preset options (e.g. ['startDate', 'endDate']) */
    datePresetFilterKeys?: string[];
    /** Date preset options */
    datePresets?: ExcelFilterValueOption[];
    /** Status options for status filter (default: confirmed / cancelled) */
    statusOptions?: ExcelFilterValueOption[];
    /** Payment mode list for paymentMode filter */
    paymentModes?: string[];
    /** Course list for course filter */
    courses?: string[];

    /** Called when user clicks Save. Parent is responsible for making the API call. */
    onSave: (_payload: Partial<ExcelTemplate> & { _id: string }) => Promise<void>;
}

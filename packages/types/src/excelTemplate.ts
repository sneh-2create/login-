export interface ExcelTemplate {
    _id: string;
    viewName: string;
    report: string;
    entity: string;
    tableHeads: TableHead[];
    filterValues?: FilterValue[];
    sortBy?: string;
    sortOrder?: 'ascending' | 'descending';
    isDefault?: boolean;
}

export interface TableHead {
    name: string;
    value: string;
    seqNo: number;
    type?: string;
}

export interface FilterValue {
    filter: string;
    value: string;
}

export interface ExcelTemplatePayload {
    entity: string;
    report: string;
}

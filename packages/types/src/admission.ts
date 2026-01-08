export interface AdmissionSummaryReportParams {
    entity: string;
    session?: string[];
    startDate: number;
    endDate: number;
    excludeUnpaid?: boolean;
}

export interface AdmissionSummaryTableRow {
    position: number;
    course: string;
    stream: string;
    total: number;
    totalOpen: number;
    [key: string]: any;
}

export interface CounselorTagReportTableRow {
    position: number;
    counselorName: string;
    totalCount: number;
    [key: string]: any;
}

export interface VacantSeatsReportTableRow {
    position: number;
    course: string;
    stream: string;
    batch?: string;
    name: string;
    seats: number;
    availableSeats: number;
    filledSeats: number;
    pendingApplications: number;
}

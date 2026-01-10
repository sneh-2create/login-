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

export interface SourceWiseReportData {
    source: string;
    totalLeadCount: number;
    totalApplicationCount: number;
    [key: string]: any; // For dynamic tags
}

export interface SourceWiseReportTableRow extends SourceWiseReportData {
    position: number;
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

export interface CourseWiseTagReportData {
    course: string;
    stream: string;
    total: number;
    [key: string]: any; // For dynamic tags
}

export interface CourseWiseTagReportTableRow extends CourseWiseTagReportData {
    position: number;
}

export interface NepSubjectReportData {
    name: string;
    code?: string;
    seats: number;
    availableSeats: number;
    filledSeats: number;
    pendingApplications: number;
}

export interface NepSubjectReportTableRow extends NepSubjectReportData {
    position: number;
}

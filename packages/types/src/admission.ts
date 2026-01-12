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

export interface CounselorProductivityReportData {
    counselorName: string;
    totalCount: number;
    engagedCount: number;
    untouchedCount: number;
    completeFollowUp: number;
    overDueFollowUp: number;
    tags: { tag: string; count: number }[];
    [key: string]: any;
}

export interface CounselorProductivityReportTableRow extends CounselorProductivityReportData {
    position: number;
}

export interface AdmissionLeadLog {
    _id: string;
    name: string;
    phone: string;
    email: string;
    course: string;
    stream: string;
    batch?: string;
    source: string;
    status: string;
    date: number; // timestamp
    dob?: number; // timestamp
    counselorName?: string;
    counselorEmail?: string;
    counselorPhone?: string;
    remark?: string;
    officialRemark?: string;
    followUpDate?: number;
    followUpQuery?: string;
    callDetails?: {
        callStatus: string;
        callDuration: string;
        callTimestamp: number;
        callRecordingLink: string;
    };
    studentData?: {
        applicationNumber?: string;
    };
    tags?: string[];
    updatedByUserName?: string;
    updatedAt?: number;
    applicationNumber?: string;
    sourceId?: string; // If converted
}

export interface AdmissionLeadLogPayload {
    entity: string;
    session: string;
    counselorId?: string;
    startDate?: number;
    endDate?: number;
    source?: string;
    status?: string[];
    callStatus?: string;
    pageSize: number;
    pageNumber: number;
    memberDetails?: boolean;
}

export interface AdmissionLeadLogResponse {
    data: AdmissionLeadLog[];
    count: number;
}

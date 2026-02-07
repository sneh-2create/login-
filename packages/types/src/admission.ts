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
    search?: string;
    phone?: string;
}

export interface AdmissionLeadLogResponse {
    data: AdmissionLeadLog[];
    count: number;
}

export interface AdmissionFollowUp {
    _id: string;
    applicationNumber?: string;
    studentData?: {
        name: string;
        phone: string;
        date: number;
        course: string;
        stream: string;
        _id: string; // Used for navigation
    };
    counselorName: string;
    createdAt: number;
    followUpQuery: string;
    followUpDate: number;
    status: string;
    completionRemark?: string;
}

export interface AdmissionFollowUpPayload {
    entity: string;
    session?: string;
    counselorId?: string;
    startDate?: number;
    endDate?: number;
    status?: string | string[]; // Can be single ('pending') or possibly array if expanded
    pageSize?: number;
    pageNumber?: number;
}


export interface AdmissionFollowUpStats {
    total: number;
    todayFollowUps: number;
    upcomingFollowUps: number;
    overdueFollowUps: number;
    completedFollowUps: number;
}

export interface BankDetails {
    bankName?: string;
    branchName?: string;
    ifscCode?: string;
    accountNumber?: string;
    studentName?: string;
}

export interface AdmissionLead {
    _id: string;
    entityId: string;
    session: string;
    name: string;
    phone: string;
    email?: string;
    alternatePhone?: string;
    course?: string; // Class
    stream?: string;
    applicationNumber?: string;
    source?: string;
    campusVisited?: string; // 'yes' | 'no'
    counselorId?: string;
    counselorName?: string;
    tags?: { tag: string; date: number }[];
    date: number;
    status?: string;
    currentStage?: string;
    fatherName?: string;
    timeline?: any[];
    bankDetails?: BankDetails;
    [key: string]: any; // Allow dynamic document fields
}

export interface AdmissionLeadPayload {
    entity: string;
    session: string;
    pageNumber: number;
    pageSize: number;
    search?: string;
    searchType?: string; // 'name', 'phone', 'applicationNumber', 'fatherName', 'references'
    counselorId?: string;
    startDate?: number;
    endDate?: number;
}

export interface AdmissionStudentDataPayload {
    entity: string;
    session: string;
    stage?: string;
    course?: string[];
    stream?: string[];
    batch?: string[];
    engagementStatus?: string[];
    startDate?: number;
    endDate?: number;
    updatedAtStartDate?: number;
    updatedAtEndDate?: number;
    counselorId?: string;
    tag?: string[];
    source?: string[];
    searchBy?: string;
    search?: string;
    pageSize?: number;
    pageNumber?: number;
    noCounselor?: boolean;
    memberDetails?: boolean;
}

export interface AdmissionStageSetup {
    _id: string;
    entity: string;
    session: string;
    stage: string;
    sequence: number;
    txnRequired: boolean;
    fields: any[];
    currentStage?: string; // Mapped property
}

export interface AdmissionStageCount {
    stage: string;
    count: number;
    currentStage?: string; // keeping for backward compatibility if any
}

export interface AdmissionTransaction {
    _id: string;
    receiptId: string;
    studentRegNo?: string;
    studentData: {
        name: string;
        phone: string;
        fatherName?: string;
    };
    applicationDetails: {
        course: string;
        stream: string;
        batch?: string;
        section?: string;
        oldNew?: string;
        category?: string;
        applicationNumber?: string;
    };
    receipt?: {
        admissionHead: string;
        paidAmount: number;
    }[];
    paymentDetails: {
        refId?: string;
        date: number;
        bankName?: string;
        paymentMode: string;
        totalPaybleAmount: number;
        paidAmount: number;
        paymentDetails?: any;
    };
    totalPaidAmount: number;
    date: number;
    status: string; // 'confirmed' | 'cancelled'
    remark?: string;
    editRemark?: string;
    admissionHeads?: string[];
    [key: string]: any; // Allow dynamic fee heads
}

export interface AdmissionTransactionPayload {
    entity: string;
    session: string;
    startDate?: number;
    endDate?: number;
    status?: string; // 'confirmed' | 'cancelled'
    selectedStatus?: string; // API param from angular 'apiStatusList' (True/False values?)
    search?: string;
    pageNumber?: number;
    pageSize?: number;
}


export interface AdmissionDailyCollectionReportParams {
    entity: string;
    session?: string[]; // Angular uses selectedSession array
    startDate: number;
    endDate: number;
    status?: string;
    paymentMode?: string;
    courses?: string[];
}

export interface AdmissionVisit {
    _id: string;
    studentData?: {
        name: string;
        applicationNumber?: string;
        fatherName?: string;
        schoolName?: string;
        course?: string;
        currentStage?: string;
    };
    visitDate: number;
    remark?: string;
    createdBy?: string;
    createdAt?: number;
}

export interface AdmissionVisitPayload {
    entity: string;
    session?: string;
    studentId?: string; // ID of the student
    pageSize?: number;
    pageNumber?: number;
}

export interface AdmissionNote {
    _id: string;
    studentData?: {
        name: string;
        applicationNumber?: string;
        fatherName?: string;
        schoolName?: string;
        course?: string;
        currentStage?: string;
    };
    noteDate: number;
    note: string;
    createdBy?: string;
    createdAt?: number;
}

export interface AdmissionNotePayload {
    entity: string;
    session?: string;
    studentId?: string;
    pageSize?: number;
    pageNumber?: number;
}

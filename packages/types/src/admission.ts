export interface admissionSummaryReportParams {
    entity: string;
    session?: string[];
    startDate: number;
    endDate: number;
    excludeUnpaid?: boolean;
}

export interface admissionSummaryTableRow {
    position: number;
    course: string;
    stream: string;
    total: number;
    totalOpen: number;
    [key: string]: any;
}

export interface counselorTagReportTableRow {
    position: number;
    counselorName: string;
    totalCount: number;
    [key: string]: any;
}

export interface sourceWiseReportData {
    source: string;
    totalLeadCount: number;
    totalApplicationCount: number;
    [key: string]: any; // For dynamic tags
}

export interface sourceWiseReportTableRow extends sourceWiseReportData {
    position: number;
}

export interface vacantSeatsReportTableRow {
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

export interface courseWiseTagReportData {
    course: string;
    stream: string;
    total: number;
    [key: string]: any; // For dynamic tags
}

export interface courseWiseTagReportTableRow extends courseWiseTagReportData {
    position: number;
}

export interface nepSubjectReportData {
    name: string;
    code?: string;
    seats: number;
    availableSeats: number;
    filledSeats: number;
    pendingApplications: number;
}

export interface nepSubjectReportTableRow extends nepSubjectReportData {
    position: number;
}

export interface counselorProductivityReportData {
    counselorName: string;
    totalCount: number;
    engagedCount: number;
    untouchedCount: number;
    completeFollowUp: number;
    overDueFollowUp: number;
    tags: { tag: string; count: number }[];
    [key: string]: any;
}

export interface counselorProductivityReportTableRow extends counselorProductivityReportData {
    position: number;
}

export interface admissionLeadLog {
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

export interface admissionLeadLogPayload {
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

export interface admissionLeadLogResponse {
    data: admissionLeadLog[];
    count: number;
}

export interface admissionFollowUp {
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

export interface admissionFollowUpPayload {
    entity: string;
    session?: string;
    counselorId?: string;
    startDate?: number;
    endDate?: number;
    status?: string | string[]; // Can be single ('pending') or possibly array if expanded
    pageSize?: number;
    pageNumber?: number;
}


export interface admissionFollowUpStats {
    total: number;
    todayFollowUps: number;
    upcomingFollowUps: number;
    overdueFollowUps: number;
    completedFollowUps: number;
}

export interface admissionLead {
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
}

export interface admissionLeadPayload {
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

export interface admissionStudentDataPayload {
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

export interface admissionStageSetup {
    _id: string;
    entity: string;
    session: string;
    stage: string;
    sequence: number;
    txnRequired: boolean;
    fields: any[];
    currentStage?: string; // Mapped property
}

export interface admissionStageCount {
    stage: string;
    count: number;
    currentStage?: string; // keeping for backward compatibility if any
}

export interface admissionTransaction {
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

export interface admissionTransactionPayload {
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


export interface admissionDailyCollectionReportParams {
    entity: string;
    session?: string[]; // Angular uses selectedSession array
    startDate: number;
    endDate: number;
    status?: string;
    paymentMode?: string;
    courses?: string[];
}

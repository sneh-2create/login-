export interface DashboardCounts {
    totalEntities: number;
    totalStudents: number;
    totalEmployees: number;
    totalBooks: number;
}

export interface ActiveStudentData {
    name: string;
    qac: string | number;
    total: number;
    active: number;
    percentage: number;
}

export interface OnlineFeePaymentData {
    qac: string | number;
    total: number;
    online: number;
    onlinePercentage: number;
    odPay: number;
    odPayPercentage: number;
}

export interface CommunicationReportData {
    qac: string | number;
    total: number;
    sms: number;
    email: number;
    msTeams: number;
}

export interface UserEntityData {
    name: string;
    qac: string | number;
    total: number;
    active: number;
    percentage: number;
}

export interface EntityModuleCount {
    module: string;
    count: number;
}

export interface EntityLocationCount {
    name: string;
    count: number;
}

export interface StudentSessionData {
    totalStudents: number;
    boys: number;
    girls: number;
    others: number;
    inactiveStudents: number;
    inactiveBoys: number;
    inactiveGirls: number;
    inactiveOthers: number;
    percentageBoys?: number;
    percentageGirls?: number;
    percentageOthers?: number;
    differenceBoysPercentageFromPreviousSession?: number;
    differenceGirlsPercentageFromPreviousSession?: number;
    differenceOthersPercentageFromPreviousSession?: number;
    appStudents?: number;
    dormantStudents?: number;
    incorrectMobileStudents?: number;
}

export interface InactiveReason {
    remark: string;
    count: number;
}

export interface AwakeDormantCount {
    awakeStudents: number;
    dormantStudents: number;
    todayActivations: number;
}

export interface StudentCourseStrength {
    course: string;
    awakeStudents: number;
    dormantStudents: number;
    total: number;
    newAdmission?: number;
}


export interface GroupData {
    count: number;
    religion?: string;
    socialCategory?: string;
}

export interface BirthdayStudent {
    id: string;
    name: string;
    photo?: string;
    gender: string;
    course: string;
    stream: string;
    batch?: string;
    section: string;
    dob: string;
}

export interface SISDashboardResponse {
    headCount: {
        currentSession: StudentSessionData[];
        previousSession: StudentSessionData[];
    };
    birthDayStudents?: BirthdayStudent[];
    awakeDormantCount?: AwakeDormantCount[];
    todayActivations?: number;
    unresolvedODPayQueries?: number;
    inactiveReason?: InactiveReason[];
    groupByCourse?: StudentCourseStrength[];
    groupBySocialCategory?: GroupData[];
    groupByReligion?: GroupData[];
}

export interface dashboardCounts {
    totalEntities: number;
    totalStudents: number;
    totalEmployees: number;
    totalBooks: number;
}

export interface activeStudentData {
    name: string;
    qac: string;
    total: number;
    active: number;
    percentage: number;
}

export interface onlineFeePaymentData {
    qac: string;
    total: number;
    online: number;
    onlinePercentage: number;
    odPay: number;
    odPayPercentage: number;
}

export interface communicationReportData {
    qac: string;
    total: number;
    sms: number;
    email: number;
    msTeams: number;
}

export interface userEntityData {
    name: string;
    qac: string;
    total: number;
    active: number;
    percentage: number;
}

export interface entityModuleCount {
    module: string;
    count: number;
}

export interface entityLocationCount {
    name: string;
    count: number;
}

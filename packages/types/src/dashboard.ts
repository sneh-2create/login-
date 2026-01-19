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

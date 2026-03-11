export interface EmployeeHeadCount {
    total: number;
    male: number;
    female: number;
    others: number;
    malePercentage: number;
    femalePercentage: number;
    othersPercentage: number;
    newJoining: number;
    newJoiningMale: number;
    newJoiningFemale: number;
    newJoiningOthers: number;
}

export interface BirthdayEmployee {
    _id: string;
    name: string;
    dob: string; // Date string
    doj: string; // Date string
    photo: string;
    department: {
        name: string;
    };
    designation: {
        name: string;
    };
}

export interface AttendanceStatusCount {
    status: string;
    count: number;
}

export interface AttendanceCount {
    present: number;
    absent: number;
    leave: number;
    holiday: number;
    weeklyOff: number;
    others: number;
}

export interface RequestCount {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled?: number;
}

export interface LeaveRequest {
    _id: string;
    employee: {
        name: string;
        photo?: string;
    };
    leaveType: {
        name: string;
    };
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    period?: string;
    approverComment?: string;
}

export interface AttendanceLog {
    _id: string;
    employee: {
        name: string;
        employeeId: string;
        photo?: string;
        designation?: {
            name: string;
        };
        employeeType?: {
            name: string;
        };
    };
    inTime: string | null;
    outTime: string | null;
    status: string;
    punchStatus: string; // "Punched In", "No Punch", etc.
}

export interface HodDashboardResponse {
    headCount: EmployeeHeadCount;
    birthdayEmployees: BirthdayEmployee[];
    attendanceCount: AttendanceCount;
    arCount: RequestCount;
    leaveCount: RequestCount;
    laCount: RequestCount; // Late Arrival
    odCount: RequestCount; // On Duty
    leaveList: LeaveRequest[];
    punchDataEmployees: AttendanceLog[];
    dueTask?: any;
}

export interface HrmMasterResponse {
    employeeTypes: {
        _id: string;
        name: string;
    }[];
    // Add other master data fields if needed
}

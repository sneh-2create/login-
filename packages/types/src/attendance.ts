export interface AttendanceInstituteSummary {
    course: string;
    stream: string;
    batch?: string;
    section: string;
    totalPresent: number;
    totalAbsent: number;
    totalLeave: number;
    totalNotMarked: number;
    dateTime?: string;
    sequenceNo?: number;
}

export interface AppliedLeave {
    _id: string;
    studentRegNo: string;
    course: string;
    stream: string;
    batch: string;
    section: string;
    student: {
        name: string;
        _id: string;
    };
    leaveStartDate: number;
    leaveEndDate: number;
    leaveStatus: 'applied' | 'cancelled' | 'rejected' | 'approved' | 'partiallyApproved';
    reason: string;
    remark: string;
}

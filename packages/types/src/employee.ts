export interface EmployeeTypeCount {
    employeeType: string;
    count: number;
}

export interface HeadCount {
    totalEmployees: number;
    male: number;
    female: number;
    others: number;
    malePercentage?: number;
    femalePercentage?: number;
    otherPercentage?: number;
    newJoinee: number;
    newJoineeMale: number;
    newJoineeFemale: number;
    newJoineeOthers: number;
}

export interface EmployeeBirthday {
    _id: string;
    name: string;
    department: string;
    dob: string;
    photo?: string;
    gender?: string;
}

export interface EmployeeDepartmentCount {
    department: string;
    count: number;
}

export interface EmployeeLeaveRequest {
    employeeId: string;
    employeeName: string;
    leaveStartDate: string;
    leaveEndDate: string;
    reason: string;
    remark: string;
    leaveStatus: string;
}

export interface EmployeeTaskItem {
    title: string;
    assignedToName: string;
    dueDate: string;
    priority: string;
    status: string;
}

export interface EmployeeAttendanceStatusCount {
    attendanceValue: string;
    count: number;
}

export interface EmployeeStatusCount {
    status: string;
    count: number;
}

export interface EmployeeLeaveStatusCount {
    leaveStatus: string;
    count: number;
}

export interface EmployeeDueTask {
    overdue: number;
    todayDue: number;
    weekDue: number;
}

export interface EmployeePunchData {
    employeeId: string;
    employeeName: string;
    employeeType: string;
    designation: string;
    department: string;
    status: string;
    inTime: string;
    outTime: string;
}

export interface EmployeeDashboardResponse {
    groupByEmployeeType: EmployeeTypeCount[];
    headCount: HeadCount[];
    birthdayEmployees: EmployeeBirthday[];
    groupByDepartment: EmployeeDepartmentCount[];
    leaveList: EmployeeLeaveRequest[];
    taskList: EmployeeTaskItem[];
    punchInCount: { count: number }[];
    arCount: EmployeeStatusCount[];
    odCount: EmployeeStatusCount[];
    laCount: EmployeeStatusCount[];
    attendanceCount: EmployeeAttendanceStatusCount[];
    leaveCount: EmployeeLeaveStatusCount[];
    dueTask: EmployeeDueTask;
    punchDataEmployees: EmployeePunchData[];
}

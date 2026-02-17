
export interface EmployeeProfile {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    mobile: string;
    photo?: string;
    gender?: string;
    joiningDate: string;
    designation: string;
    role: string[];
    qualification: string;
    experience?: string;
    nationality?: string;
    dob?: string;
    state?: string;
    city?: string;
    maritalStatus?: string;
    address?: string;
}

export interface ProfileBirthdayEmployee {
    _id: string;
    name: string;
    photo?: string;
    department: string;
    dob: string;
    gender?: string;
}

export interface Announcement {
    _id: string;
    title: string;
    message: string;
    notificationType: 'employeeAnnouncement' | 'notice' | 'circular';
    createdAt: string;
}

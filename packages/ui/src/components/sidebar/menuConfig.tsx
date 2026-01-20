
import {
    LayoutDashboard,
    Users,
    DollarSign,
    FileText,
    Briefcase,
    Settings,
    GraduationCap,
    Calendar,
    MessageSquare,
    BarChart3,
    Library,
} from 'lucide-react';
import { menuItem } from '../../global/types';

export const menuItems: menuItem[] = [
    {
        title: 'Dashboard',
        icon: <LayoutDashboard size={24} />,
        page: '/',
    },
    {
        title: 'Admission',
        icon: <Users size={24} />,
        submenu: [
            {
                title: 'Admission Leads',
                submenu: [
                    { title: 'Lead List', page: '/admission/leads' },
                    { title: 'Add New Lead', page: '/admission/leads/new' },
                    { title: 'Follow-ups', page: '/admission/leads/followups' },
                ],
            },
            {
                title: 'Student Data',
                submenu: [
                    { title: 'Student List', page: '/admission/students' },
                    { title: 'Admission Form', page: '/admission/students/form' },
                    { title: 'Documents', page: '/admission/students/documents' },
                ],
            },
            {
                title: 'Reports',
                submenu: [
                    { title: 'Admission Report', page: '/admission/reports/admission' },
                    { title: 'Lead Source Report', page: '/admission/reports/source' },
                ],
            },
        ],
    },
    {
        title: 'Fee',
        icon: <DollarSign size={24} />,
        submenu: [
            {
                title: 'Fee Collection',
                submenu: [
                    { title: 'Collect Fee', page: '/fee/collect' },
                    { title: 'Fee Receipts', page: '/fee/receipts' },
                    { title: 'Due List', page: '/fee/due' },
                ],
            },
            {
                title: 'Fee Structure',
                submenu: [
                    { title: 'Manage Structure', page: '/fee/structure' },
                    { title: 'Fee Categories', page: '/fee/categories' },
                ],
            },
        ],
    },
    {
        title: 'Student',
        icon: <GraduationCap size={24} />,
        submenu: [
            {
                title: 'Student Management',
                submenu: [
                    { title: 'Student List', page: '/student/list' },
                    { title: 'Promote Students', page: '/student/promote' },
                    { title: 'Transfer Certificate', page: '/student/tc' },
                ],
            },
        ],
    },
    {
        title: 'Attendance',
        icon: <Calendar size={24} />,
        submenu: [
            {
                title: 'Mark Attendance',
                page: '/attendance/mark',
            },
            {
                title: 'Attendance Reports',
                submenu: [
                    { title: 'Daily Report', page: '/attendance/reports/daily' },
                    { title: 'Monthly Report', page: '/attendance/reports/monthly' },
                ],
            },
        ],
    },
    {
        title: 'Examination',
        icon: <FileText size={24} />,
        submenu: [
            {
                title: 'Exam Setup',
                submenu: [
                    { title: 'Create Exam', page: '/exam/create' },
                    { title: 'Exam Schedule', page: '/exam/schedule' },
                ],
            },
            {
                title: 'Results',
                submenu: [
                    { title: 'Enter Marks', page: '/exam/marks' },
                    { title: 'Result Processing', page: '/exam/results' },
                ],
            },
        ],
    },
    {
        title: 'HRM',
        icon: <Briefcase size={24} />,
        submenu: [
            {
                title: 'Employee Management',
                submenu: [
                    { title: 'Employee List', page: '/hrm/employees' },
                    { title: 'Add Employee', page: '/hrm/employees/new' },
                    { title: 'Attendance', page: '/hrm/attendance' },
                ],
            },
            {
                title: 'Payroll',
                submenu: [
                    { title: 'Generate Salary', page: '/hrm/payroll/generate' },
                    { title: 'Salary Slips', page: '/hrm/payroll/slips' },
                ],
            },
        ],
    },
    {
        title: 'Library',
        icon: <Library size={24} />,
        submenu: [
            {
                title: 'Books',
                submenu: [
                    { title: 'Book List', page: '/library/books' },
                    { title: 'Issue Book', page: '/library/issue' },
                    { title: 'Return Book', page: '/library/return' },
                ],
            },
        ],
    },
    {
        title: 'Communication',
        icon: <MessageSquare size={24} />,
        submenu: [
            {
                title: 'Send SMS', page: '/communication/sms',
            },
            {
                title: 'Send Email', page: '/communication/email',
            },
        ],
    },
    {
        title: 'Analytics',
        icon: <BarChart3 size={24} />,
        page: '/analytics',
    },
    {
        title: 'Back Office',
        icon: <Settings size={24} />,
        submenu: [
            {
                title: 'School Setup',
                submenu: [
                    { title: 'Academic Year', page: '/back-office/academic-year' },
                    { title: 'Classes', page: '/back-office/classes' },
                    { title: 'Sections', page: '/back-office/sections' },
                ],
            },
            {
                title: 'User Management',
                submenu: [
                    { title: 'Users', page: '/back-office/users' },
                    { title: 'Roles', page: '/back-office/roles' },
                ],
            },
        ],
    },
];

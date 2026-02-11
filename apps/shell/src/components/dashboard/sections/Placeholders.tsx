
const PlaceholderValues = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">Coming Soon</p>
        </div>
    </div>
);

export const StudentOverviewSection = () => <PlaceholderValues title="Student Overview" />;
export const FeeSection = () => <PlaceholderValues title="Fee Management" />;
export const AdmissionSectionPlaceholder = () => <PlaceholderValues title="Admission Management" />; // Renamed to avoid conflict if imported
export { CalendarSection } from '../calendar/CalendarSection';
// export const AttendanceSection = () => <PlaceholderValues title="Attendance" />;
export { AttendanceSection } from './AttendanceSection';
// export const ExaminationSection = () => <PlaceholderValues title="Examination" />;
export { ExaminationSection } from './ExaminationSection';

export const EmployeeSection = () => <PlaceholderValues title="Employee Management" />;
// Real Components
export { HODSection } from './HODSection';
export { CommunicationSection } from './CommunicationSection';
export { AnalyticsSection } from './AnalyticsSection';
export const LibrarySection = () => <PlaceholderValues title="Library Management" />;
// export const ProfileSection = () => <PlaceholderValues title="My Profile" />;
export { ProfileSection } from '../profile/ProfileSection';
// export const MessSection = () => <div className="p-4 bg-white rounded-lg shadow">Mess Management Dashboard Placeholder</div>;
export { MessSection } from './MessSection';

// Re-export AdmissionSection to satisfy old imports if needed, but we should switch to real component.
export { AdmissionSectionPlaceholder as AdmissionSection };

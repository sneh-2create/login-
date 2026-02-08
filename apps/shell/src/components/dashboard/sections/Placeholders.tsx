
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
export const AttendanceSection = () => <PlaceholderValues title="Attendance" />;
export const ExaminationSection = () => <PlaceholderValues title="Examination" />;
export const EmployeeSection = () => <PlaceholderValues title="Employee Management" />;
// Real Components
export { HODSection } from './HODSection';
export { CommunicationSection } from './CommunicationSection';
export { AnalyticsSection } from './AnalyticsSection';
export const LibrarySection = () => <PlaceholderValues title="Library Management" />;
export const ProfileSection = () => <PlaceholderValues title="My Profile" />;
export const MessSection = () => <PlaceholderValues title="Mess Management" />;

// Re-export AdmissionSection to satisfy old imports if needed, but we should switch to real component.
export { AdmissionSectionPlaceholder as AdmissionSection };

import { AdmissionLead } from '@od-erp/types';

import { useAppSelector } from '@od-erp/store';

interface StudentInfoBarProps {
    student: AdmissionLead;
}

const StudentInfoBar = ({ student }: StudentInfoBarProps) => {
    const entityPreferences = useAppSelector((state: any) => state.auth.entityPreferences);
    const getDisplayName = (key: string) => {
        // Return display name or Capitalized key
        return entityPreferences?.displayNames?.find((d: any) => d.value === key)?.name || key.charAt(0).toUpperCase() + key.slice(1);
    };

    return (
        <div className="px-3 py-2 border-b flex justify-between items-center text-sm">
            <div className="flex gap-4 overflow-x-auto pb-1 md:pb-0">
                <div>
                    <span className="block text-gray-400 text-[10px] font-bold tracking-wider">Name</span>
                    <span className="font-semibold text-gray-800 text-xs">{student.name}</span>
                </div>
                <div>
                    <span className="block text-gray-400 text-[10px] font-bold tracking-wider">{getDisplayName('applicationNumber')}</span>
                    <span className="font-semibold text-gray-800 text-xs">{student.applicationNumber || '-'}</span>
                </div>
                <div>
                    <span className="block text-gray-400 text-[10px] font-bold tracking-wider">Father Name</span>
                    <span className="font-semibold text-gray-800 text-xs">{student.fatherName || '-'}</span>
                </div>
                <div>
                    <span className="block text-gray-400 text-[10px] font-bold tracking-wider">{getDisplayName('course')}</span>
                    <span className="font-semibold text-gray-800 text-xs">{student.course || '-'}</span>
                </div>
                <div>
                    <span className="block text-gray-400 text-[10px] font-bold tracking-wider">{getDisplayName('stream')}</span>
                    <span className="font-semibold text-gray-800 text-xs">{student.stream || '-'}</span>
                </div>
                <div>
                    <span className="block text-gray-400 text-[10px] font-bold tracking-wider">Stage</span>
                    <span className="font-semibold text-orange-600 text-xs">{student.currentStage || 'Lead'}</span>
                </div>
            </div>
        </div>
    );
};

export default StudentInfoBar;

import { AdmissionLead } from '@od-erp/types';
import MoveStudentModal from '../../AdmissionStudentData/components/MoveStudentModal';

interface MoveStudentViewProps {
    student: AdmissionLead;
}

const MoveStudentView = ({ student }: MoveStudentViewProps) => {
    return (
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)]">
            <MoveStudentModal
                isOpen={true}
                onClose={() => {}}
                student={student}
                onSuccess={() => {}}
            />
        </div>
    );
};

export default MoveStudentView;

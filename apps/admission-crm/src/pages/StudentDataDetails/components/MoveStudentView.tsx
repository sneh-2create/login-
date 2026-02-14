import { AdmissionLead } from '@od-erp/types';
import MoveStudentModal from '../../AdmissionStudentData/components/MoveStudentModal';

interface MoveStudentViewProps {
    student: AdmissionLead;
}

const MoveStudentView = ({ student }: MoveStudentViewProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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

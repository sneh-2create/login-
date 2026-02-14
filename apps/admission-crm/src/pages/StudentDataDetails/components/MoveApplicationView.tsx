import { AdmissionLead } from '@od-erp/types';
import MoveApplicationModal from '../../AdmissionStudentData/components/MoveApplicationModal';

interface MoveApplicationViewProps {
    student: AdmissionLead;
}

const MoveApplicationView = ({ student }: MoveApplicationViewProps) => {
    // Note: MoveApplicationModal is designed as a modal component
    // For inline rendering, we're rendering it without the modal backdrop
    // The component internally handles its own content display
    return (
        <div className="space-y-4">
            <MoveApplicationModal
                isOpen={true}
                onClose={() => {}}
                student={student}
                onSuccess={() => {}}
                inline={true}
            />
        </div>
    );
};

export default MoveApplicationView;

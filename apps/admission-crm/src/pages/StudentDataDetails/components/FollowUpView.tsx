import { AdmissionLead } from '@od-erp/types';
import ViewFollowUpModal from '../../../components/Modals/ViewFollowUpModal';

interface FollowUpViewProps {
    student: AdmissionLead;
}

const FollowUpView = ({ student }: FollowUpViewProps) => {
    return (
        <div className="space-y-4">
            <ViewFollowUpModal
                isOpen={true}
                onClose={() => {}}
                student={student}
                onSaveSuccess={() => {}}
                inline={true}
            />
        </div>
    );
};

export default FollowUpView;

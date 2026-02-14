import { AdmissionLead } from '@od-erp/types';
import { ViewDocumentsModal } from '@od-erp/ui';
import { useAppSelector } from '@od-erp/store';
import { admissionStudentDataService } from '@od-erp/api-client';

interface DocumentsViewProps {
    student: AdmissionLead;
}

const DocumentsView = ({ student }: DocumentsViewProps) => {
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    
    // Note: ViewDocumentsModal from @od-erp/ui is designed as a modal component
    // For inline rendering, we're rendering it without the modal backdrop
    // The component internally handles its own content display
    return (
        <div className="space-y-4">
            <ViewDocumentsModal
                isOpen={true}
                onClose={() => {}}
                student={student}
                entityName={student?.name}
                permissions={permissions}
                onUploadSuccess={() => {}}
                inline={true}
                apiConfig={{
                    getPresignedUrl: admissionStudentDataService.getPresignedUrl,
                    uploadFileToUrl: admissionStudentDataService.uploadFileToUrl,
                    uploadDocuments: admissionStudentDataService.uploadAdmissionDocuments,
                }}
            />
        </div>
    );
};

export default DocumentsView;

import VerifyDocuments from '../../AdmissionStudentData/components/VerifyDocuments';

interface VerifyDocumentsViewProps {
    studentId: string;
    inline?: boolean;
}

const VerifyDocumentsView = ({ studentId, inline = false }: VerifyDocumentsViewProps) => {
    return (
        <VerifyDocuments studentId={studentId} inline={inline} />
    );
};

export default VerifyDocumentsView;

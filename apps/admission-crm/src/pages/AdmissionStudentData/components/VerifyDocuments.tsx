import { useParams, useNavigate } from 'react-router-dom';
import { useViewAdmissionStudentData, useAdmissionStageSetup, useEditAdmissionStudentData } from '@od-erp/query';
import { Button, Dropdown, Breadcrumb } from '@od-erp/ui';
import { useState, useMemo } from 'react';
import AdmissionFormTemplate from './AdmissionFormTemplate';
import ViewFollowUpModal from '../../../components/Modals/ViewFollowUpModal';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import { STUDENT_ADMISSION_UPLOAD_DOCUMENT_LIST } from '@od-erp/constants';
import { useAppSelector } from '@od-erp/store';

interface VerifiedDocument {
    documentName: string;
    documentSrc: string;
    verifyStatus: boolean;
    userName: string;
    userMobile: string;
    date: Date;
}

const VerifyDocuments = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: student, isLoading, refetch } = useViewAdmissionStudentData(id || '');
    const [selectedDocument, setSelectedDocument] = useState('');
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get entity and session from Redux
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id);
    const selectedSession = useAppSelector((state) => state.session.academicSession);
    const userName = useAppSelector((state) => state.auth.user?.name);
    const userMobile = useAppSelector((state) => state.auth.user?.mobile);

    // Fetch stage setup for custom display names
    const { data: stageSetup } = useAdmissionStageSetup(entityId || '', selectedSession || '');

    // Mutation for verification
    const editStudentMutation = useEditAdmissionStudentData();

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Dashboard', href: '/entity/dashboard' },
        { label: 'Application Data', href: '/admissionStudentData' },
        { label: 'Verify Documents', href: '#' }
    ];

    // Build document list with custom display names from stage setup
    const studentDocumentList = useMemo(() => {
        if (!student) return [];

        // Start with base document list
        let docList = [...STUDENT_ADMISSION_UPLOAD_DOCUMENT_LIST];

        // Apply custom display names from stage setup
        if (stageSetup && stageSetup.length > 0) {
            docList = docList.map(doc => {
                let customName = doc.label;
                
                // Search through all stages for custom field names
                for (const stage of stageSetup) {
                    if (stage.fields) {
                        for (const field of stage.fields) {
                            if (field.key === doc.key && field.displayName) {
                                customName = field.displayName;
                                break;
                            }
                        }
                    }
                }
                
                return { ...doc, label: customName };
            });
        }

        // Filter to only show documents that student has uploaded
        return docList.filter(doc => student[doc.key as keyof typeof student]);
    }, [student, stageSetup]);

    // Get verification status for selected document
    const verificationInfo = useMemo(() => {
        if (!selectedDocument || !student?.verifiedDocuments) {
            return { isVerified: false, adminName: '', dateValue: null };
        }

        const verifiedDoc = (student.verifiedDocuments as VerifiedDocument[]).find(
            (doc: VerifiedDocument) => doc.documentName === selectedDocument
        );

        if (verifiedDoc) {
            return {
                isVerified: true,
                adminName: verifiedDoc.userName,
                dateValue: new Date(verifiedDoc.date)
            };
        }

        return { isVerified: false, adminName: '', dateValue: null };
    }, [selectedDocument, student]);

    // Transform Google Drive URLs to preview mode
    const getDocumentUrl = (url: string) => {
        if (!url) return '';
        
        // Transform Google Drive URLs
        if (url.includes('drive.google.com')) {
            // Replace 'view' with 'preview' for iframe display
            return url.replace('/view', '/preview');
        }
        
        return url;
    };

    // Get current document URL
    const imgURL = useMemo(() => {
        if (!selectedDocument || !student) return '';
        const url = student[selectedDocument as keyof typeof student] as string;
        return getDocumentUrl(url);
    }, [selectedDocument, student]);

    // Verify document
    const handleVerifyDocument = async () => {
        if (!student || !selectedDocument || !userName || !userMobile) {
            console.error('Missing required data:', { student: !!student, selectedDocument, userName, userMobile });
            alert('Missing required information. Please ensure you are logged in.');
            return;
        }

        setLoading(true);
        try {
            // Get current verified documents or initialize empty array
            const verifiedDocuments = Array.isArray(student.verifiedDocuments) 
                ? [...student.verifiedDocuments] 
                : [];
            
            // Add new verification
            const newVerification = {
                documentName: selectedDocument,
                documentSrc: student[selectedDocument as keyof typeof student] as string,
                verifyStatus: true,
                userName: userName,
                userMobile: userMobile,
                date: new Date()
            };
            
            verifiedDocuments.push(newVerification);

            // Prepare payload - send entire student object with updated verifiedDocuments
            const payload = {
                ...student,
                verifiedDocuments
            };
            
            // Update student data
            await editStudentMutation.mutateAsync(payload);
            
            // Refetch to get updated data
            await refetch();
            
            alert('Document verified successfully!');
        } catch (error) {
            console.error('=== Verification failed ===');
            console.error('Error:', error);
            alert('Failed to verify document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Unverify document
    const handleUnverifyDocument = async () => {
        
        if (!student || !selectedDocument) {
            console.error('Missing required data:', { student: !!student, selectedDocument });
            alert('Missing required information.');
            return;
        }

        setLoading(true);
        try {
            // Filter out the document to unverify
            const verifiedDocuments = Array.isArray(student.verifiedDocuments)
                ? student.verifiedDocuments.filter(
                    (doc: VerifiedDocument) => doc.documentName !== selectedDocument
                )
                : [];
            
            // Prepare payload - send entire student object with updated verifiedDocuments
            const payload = {
                ...student,
                verifiedDocuments
            };
            
            // Update student data
            await editStudentMutation.mutateAsync(payload);
            
            // Refetch to get updated data
            await refetch();
            
            alert('Document unverified successfully!');
        } catch (error) {
            console.error('=== Unverification failed ===');
            console.error('Error:', error);
            alert('Failed to unverify document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading student details...</div>;
    if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Documents</h1>
                        <Breadcrumb items={breadcrumbItems} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admission/studentData')}
                        >
                            Back to List
                        </Button>
                        <Button
                            variant="primary"
                            className="flex items-center gap-2"
                            onClick={() => setIsFollowUpOpen(true)}
                            disabled={!student.counselorId}
                        >
                            <MessageSquare size={16} /> View Follow Up
                        </Button>
                    </div>
                </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Document View */}
                <div className="w-1/2 px-6 py-2 border-r border-gray-200 overflow-y-auto bg-white flex flex-col">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Document
                        </label>
                        <Dropdown
                            options={studentDocumentList.map(doc => ({
                                label: doc.label,
                                value: doc.key
                            }))}
                            value={selectedDocument}
                            onChange={(value) => setSelectedDocument(value as string)}
                            placeholder="Select Document"
                            className="w-full"
                        />
                    </div>

                    {/* Verification Status */}
                    {selectedDocument && verificationInfo.isVerified && (
                        <div className="mb-4 flex items-center justify-end gap-2 text-green-600">
                            <p className="text-sm">
                                Verified by {verificationInfo.adminName} on{' '}
                                {verificationInfo.dateValue?.toLocaleDateString()}
                            </p>
                            <CheckCircle2 size={20} className="text-green-600" />
                        </div>
                    )}

                    {/* Document Placeholder / Viewer */}
                    <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden relative mb-4">
                        {!selectedDocument ? (
                            <span>Select a document to view</span>
                        ) : !imgURL ? (
                            <span>Document not uploaded</span>
                        ) : (
                            <iframe src={imgURL} className="w-full h-full" title={selectedDocument} />
                        )}
                    </div>

                    {/* Action Buttons */}
                    {selectedDocument && imgURL && (
                        <div className="flex justify-end gap-3">
                            {!verificationInfo.isVerified ? (
                                <Button
                                    variant="primary"
                                    onClick={handleVerifyDocument}
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify Document'}
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={handleUnverifyDocument}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Mark as not verified'}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Panel: Admission Form */}
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-100">
                    <div className="shadow-md rounded-sm overflow-hidden bg-white">
                        <div className="bg-white p-8">
                            <AdmissionFormTemplate student={student} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Follow Up Modal */}
            <ViewFollowUpModal
                isOpen={isFollowUpOpen}
                onClose={() => setIsFollowUpOpen(false)}
                student={student}
            />
        </div>
    );
};

export default VerifyDocuments;

import { useParams } from 'react-router-dom';
import { useViewAdmissionStudentData } from '@od-erp/query';
import { Button, Select } from '@od-erp/ui';
import { useState } from 'react';
import AdmissionFormTemplate from './components/AdmissionFormTemplate';
import ViewFollowUpModal from './components/ViewFollowUpModal';
import { MessageSquare } from 'lucide-react';

const VerifyDocuments = () => {
    const { id } = useParams<{ id: string }>();
    const { data: student, isLoading } = useViewAdmissionStudentData(id || '');
    const [selectedDocument, setSelectedDocument] = useState('');
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading student details...</div>;
    if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Bar */}
            <div className="bg-white px-6 py-4 shadow-sm flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
                <div>
                    <div className="text-xs text-gray-500 mb-1">Dashboard &gt; Admission Data &gt; Verify Documents</div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Verify Documents <span className="text-sm font-normal text-gray-500">| Verify Documents</span>
                    </h1>
                </div>
                <Button
                    variant="primary"
                    className="flex items-center gap-2 bg-[#1e429f] hover:bg-[#1e429f]/90"
                    onClick={() => setIsFollowUpOpen(true)}
                >
                    <MessageSquare size={16} /> View Follow Up
                </Button>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Document View */}
                <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto bg-white flex flex-col">
                    <div className="mb-4">
                        <Select
                            label="Select Document"
                            options={[
                                { label: '10th Marksheet', value: '10th_marksheet' },
                                { label: '12th Marksheet', value: '12th_marksheet' },
                                { label: 'Aadhar Card', value: 'aadhar' },
                                { label: 'Photo', value: 'photo' }
                            ]}
                            value={selectedDocument}
                            onChange={(e) => setSelectedDocument(e.target.value)}
                            placeholder="Select Document"
                        />
                    </div>

                    {/* Document Placeholder / Viewer */}
                    <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        {selectedDocument ? (
                            <span>Preview for {selectedDocument} will appear here</span>
                        ) : (
                            <span>Select a document to view</span>
                        )}
                        {/* 
                           Integration Note: If 'student.documents' is available, map options dynamically 
                           and show <img src={url} /> or <iframe /> accordingly.
                        */}
                    </div>
                </div>

                {/* Right Panel: Admission Form */}
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-100">
                    <div className="shadow-md rounded-sm overflow-hidden bg-white">
                        {/* We wrap template to ensure it looks like a paper/card */}
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

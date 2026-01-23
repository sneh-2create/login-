import React, { useState } from 'react';
import { X, FileText, Eye, CloudUpload } from 'lucide-react';
import { AdmissionLead } from '@od-erp/types';
import { admissionStudentDataService } from '@od-erp/api-client';


interface ViewDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

// Simplified document list based on common requirements
// In a full implementation, this might come from a config API
const DOCUMENT_LIST = [
    { key: 'photo', label: 'Student Photo' },
    { key: 'aadhaarCardFront', label: 'Aadhaar Card Front' },
    { key: 'aadhaarCardBack', label: 'Aadhaar Card Back' },
    { key: 'motherPhoto', label: 'Mother Photo' },
    { key: 'fatherPhoto', label: 'Father Photo' },
    { key: 'birthCertificate', label: 'Birth Certificate' },
    { key: 'transferCertificate', label: 'Transfer Certificate' },
    { key: 'previousMarkSheet', label: 'Previous Mark Sheet' },
    { key: 'casteCertificate', label: 'Caste Certificate' },
    { key: 'incomeCertificate', label: 'Income Certificate' },
    { key: 'domicileCertificate', label: 'Domicile Certificate' },
    { key: 'rationCard', label: 'Ration Card' },
    { key: 'panCard', label: 'PAN Card' }
];

const ViewDocumentsModal = ({ isOpen, onClose, student }: ViewDocumentsModalProps) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadDocKey, setUploadDocKey] = useState<string | null>(null);
    const [uploadDocLabel, setUploadDocLabel] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen || !student) return null;

    // TODO: Get QAC from store or local storage. Angular uses localStorage 'qac'
    const qac = typeof window !== 'undefined' ? localStorage.getItem('qac') || 'default' : 'default';

    const documents = DOCUMENT_LIST.map(doc => {
        const url = (student as any)[doc.key];
        return {
            ...doc,
            url: url,
            isUploaded: !!url
        };
    });

    const handleView = (url: string) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleUploadClick = (doc: { key: string; label: string }) => {
        setUploadDocKey(doc.key);
        setUploadDocLabel(doc.label);
        setSelectedFile(null);
        setIsUploadModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile || !uploadDocKey || !student._id) return;

        setIsUploading(true);
        try {
            // 1. Get Presigned URL
            const presignedPayload = {
                filename: selectedFile.name,
                fileType: selectedFile.type,
                fieldName: uploadDocKey
            };

            const presignedData = await admissionStudentDataService.getPresignedUrl(qac, presignedPayload);

            if (!presignedData || !presignedData.uploadURL) {
                throw new Error('Failed to get upload URL');
            }

            // 2. Upload to S3
            await admissionStudentDataService.uploadFileToUrl(presignedData.uploadURL, selectedFile, selectedFile.type);

            // 3. Save Metadata
            const savePayload: any = {
                presignedKey: true
            };
            savePayload[uploadDocKey] = presignedData.publicURL;

            await admissionStudentDataService.uploadAdmissionDocuments(student._id, qac, savePayload);

            alert(`${uploadDocLabel} uploaded successfully!`);
            setIsUploadModalOpen(false);
            // Ideally refetch student data here. For now we might need to rely on parent refresh or just close.
            // On close, the parent might not refresh immediately unless triggered.

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const UploadModal = () => {
        if (!isUploadModalOpen) return null;

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative">
                    <button
                        onClick={() => setIsUploadModalOpen(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>

                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                        Upload {uploadDocLabel} Here
                    </h3>

                    <div className="flex flex-col items-center space-y-4">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                            "
                        />
                        {selectedFile && (
                            <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                        )}

                        <button
                            onClick={handleUploadSubmit}
                            disabled={!selectedFile || isUploading}
                            className={`w-full py-2 px-4 rounded text-white font-medium transition-colors flex justify-center items-center
                                ${!selectedFile || isUploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                            `}
                        >
                            {isUploading ? 'Uploading...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-blue-600" />
                        Student Documents
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                            <div key={doc.key} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full mr-3 ${doc.isUploaded ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">{doc.label}</h3>
                                        <span className={`text-xs ${doc.isUploaded ? 'text-green-600' : 'text-red-500'}`}>
                                            {doc.isUploaded ? 'Uploaded' : 'Not Uploaded'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-1">
                                    {doc.isUploaded ? (
                                        <button
                                            onClick={() => handleView(doc.url)}
                                            className="text-white bg-green-500 hover:bg-green-600 p-2 rounded transition-colors"
                                            title="View Document"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUploadClick(doc)}
                                            className="text-white bg-blue-500 hover:bg-blue-600 p-2 rounded transition-colors"
                                            title="Upload Document"
                                        >
                                            <CloudUpload size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
            {/* Render nested upload modal */}
            <UploadModal />
        </div>
    );
};

export default ViewDocumentsModal;

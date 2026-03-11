import React, { useState } from 'react';
import { X, Eye, CloudUpload, CircleX, CircleCheck } from 'lucide-react';
import { DocumentConfig, STUDENT_ADMISSION_UPLOAD_DOCUMENT_LIST } from '@od-erp/constants';

interface ViewDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any; // Generic entity (student/employee/etc)
    entityName?: string; // For title: "Documents for {entityName}"
    documentList?: DocumentConfig[]; // Optional custom document list
    permissions?: string[]; // User permissions array
    onUploadSuccess?: () => void; // Callback to refresh data
    inline?: boolean; // New prop for inline rendering
    apiConfig: {
        getPresignedUrl: (_qac: string, _payload: any) => Promise<any>;
        uploadFileToUrl: (_url: string, _file: File, _contentType: string) => Promise<any>;
        uploadDocuments: (_id: string, _qac: string, _payload: any) => Promise<any>;
    };
}

// File validation constants
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ViewDocumentsModal = ({ 
    isOpen, 
    onClose, 
    student, 
    entityName,
    documentList = STUDENT_ADMISSION_UPLOAD_DOCUMENT_LIST,
    permissions = [],
    onUploadSuccess,
    inline = false,
    apiConfig 
}: ViewDocumentsModalProps) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadDocKey, setUploadDocKey] = useState<string | null>(null);
    const [uploadDocLabel, setUploadDocLabel] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [validationError, setValidationError] = useState<string>('');

    if (!isOpen || !student) return null;

    // Get QAC from localStorage (consistent with Angular)
    const qac = typeof window !== 'undefined' ? localStorage.getItem('qac') || 'default' : 'default';

    // Check if user has edit permission
    const hasEditPermission = permissions.includes('editAdmissionStudentData');

    // Map documents with upload status
    const documents = documentList.map(doc => {
        const url = student[doc.key];
        return {
            ...doc,
            url: url,
            isUploaded: !!url
        };
    });

    // Validate file
    const validateFile = (file: File): { valid: boolean; error?: string } => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return { valid: false, error: 'Only images (JPEG, PNG) and PDFs are supported.' };
        }
        
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size must be less than 5MB.' };
        }
        
        return { valid: true };
    };

    const handleView = (url: string) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleUploadClick = (doc: { key: string; label: string }) => {
        setUploadDocKey(doc.key);
        setUploadDocLabel(doc.label);
        setSelectedFile(null);
        setValidationError('');
        setIsUploadModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validation = validateFile(file);
            
            if (!validation.valid) {
                setValidationError(validation.error || 'Invalid file');
                setSelectedFile(null);
            } else {
                setValidationError('');
                setSelectedFile(file);
            }
        }
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile || !uploadDocKey || !student._id) return;

        // Validate again before upload
        const validation = validateFile(selectedFile);
        if (!validation.valid) {
            setValidationError(validation.error || 'Invalid file');
            return;
        }

        setIsUploading(true);
        try {
            // 1. Get Presigned URL
            const presignedPayload = {
                filename: selectedFile.name,
                fileType: selectedFile.type,
                fieldName: uploadDocKey
            };

            const presignedData = await apiConfig.getPresignedUrl(qac, presignedPayload);

            if (!presignedData || !presignedData.uploadURL) {
                throw new Error('Failed to get upload URL');
            }

            // 2. Upload to S3
            await apiConfig.uploadFileToUrl(presignedData.uploadURL, selectedFile, selectedFile.type);

            // 3. Save Metadata
            const savePayload: any = {
                presignedKey: true
            };
            savePayload[uploadDocKey] = presignedData.publicURL;

            await apiConfig.uploadDocuments(student._id, qac, savePayload);

            alert(`${uploadDocLabel} uploaded successfully!`);
            setIsUploadModalOpen(false);
            
            // Call success callback to refresh data
            if (onUploadSuccess) {
                onUploadSuccess();
            }

            // Close the main modal so user can see refreshed data when they reopen it
            setTimeout(() => {
                onClose();
            }, 100);

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
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative">
                    <button
                        onClick={() => {
                            setIsUploadModalOpen(false);
                            setValidationError('');
                        }}
                        className="absolute top-4 right-4 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    >
                        <X size={20} />
                    </button>

                    <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 text-center">
                        Upload {uploadDocLabel} Here
                    </h3>

                    <div className="flex flex-col items-center space-y-4">
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-[var(--color-muted-foreground)]
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                            "
                        />
                        {selectedFile && (
                            <p className="text-sm text-[var(--color-muted-foreground)]">Selected: {selectedFile.name}</p>
                        )}
                        
                        {validationError && (
                            <p className="text-sm text-red-600 font-medium">{validationError}</p>
                        )}

                        <button
                            onClick={handleUploadSubmit}
                            disabled={!selectedFile || isUploading || !!validationError}
                            className={`w-full py-2 px-4 rounded text-white font-medium transition-colors flex justify-center items-center
                                ${!selectedFile || isUploading || validationError ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                            `}
                        >
                            {isUploading ? 'Uploading...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Content component
    const content = (
        <div className={inline ? "space-y-3" : "p-6 overflow-y-auto flex-1 bg-[var(--color-background)]"}>
            <div className="space-y-3">
                {documents.map((doc, index) => (
                    <div 
                        key={doc.key} 
                        className={inline ? "bg-[var(--color-card)] rounded-lg py-2 flex items-center justify-between hover:shadow-md transition-shadow" : "bg-[var(--color-card)] rounded-lg px-6 py-4 flex items-center justify-between hover:shadow-md transition-shadow"}
                    >
                        {/* Left: Serial Number + Document Name */}
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                {index + 1}
                            </div>
                            <span className="text-[var(--color-foreground)] font-medium text-base">
                                {doc.label}
                            </span>
                        </div>

                        {/* Right: Status + Upload Icon */}
                        <div className="flex items-center gap-4">
                            {/* Status Badge */}
                            {doc.isUploaded ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                        <CircleCheck size={14} />
                                    </div>
                                    <span className="text-sm font-medium">Uploaded</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600">
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                        <CircleX size={14} />
                                    </div>
                                    <span className="text-sm font-medium">Not Uploaded</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {doc.isUploaded ? (
                                    <>
                                        <button
                                            onClick={() => handleView(doc.url)}
                                            className="w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors"
                                            title="View Document"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {hasEditPermission && (
                                            <button
                                                onClick={() => handleUploadClick(doc)}
                                                className="w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors"
                                                title="Upload Again"
                                            >
                                                <CloudUpload size={18} />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {hasEditPermission && (
                                            <button
                                                onClick={() => handleUploadClick(doc)}
                                                className="w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors"
                                                title="Upload Document"
                                            >
                                                <CloudUpload size={18} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Inline mode - render content directly
    if (inline) {
        return (
            <>
                {content}
                <UploadModal />
            </>
        );
    }

    // Modal mode - render with modal wrapper
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-[var(--color-foreground)]">
                        {entityName ? `Documents for ${entityName}` : 'Student Documents'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {content}

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-[var(--color-card)] rounded-b-lg flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-foreground)] font-medium rounded-lg transition-colors"
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

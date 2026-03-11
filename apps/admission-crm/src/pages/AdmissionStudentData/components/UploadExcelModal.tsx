import React, { useState } from 'react';
import { Button } from '@od-erp/ui';
import { X, Upload } from 'lucide-react';

interface UploadExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (_file: File) => void;
    isLoading?: boolean;
}

const UploadExcelModal = ({ isOpen, onClose, onUpload, isLoading }: UploadExcelModalProps) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        onUpload(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Upload Excel</h2>
                    <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center justify-center space-y-4">
                    <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 w-full text-center hover:bg-[var(--color-background)] transition-colors">
                        <Upload className="h-12 w-12 text-[var(--color-muted-foreground)] mx-auto mb-2" />
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-2">Drag and drop your Excel file here, or click to browse</p>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                                Browse Files
                            </Button>
                        </label>
                    </div>

                    {file && (
                        <div className="w-full bg-blue-50 text-blue-700 p-2 rounded text-sm flex justify-between items-center">
                            <span className="truncate">{file.name}</span>
                            <button onClick={() => setFile(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-2">×</button>
                        </div>
                    )}

                    <div className="text-xs text-[var(--color-muted-foreground)] text-center w-full">
                        <p>Supported formats: .xlsx, .xls</p>
                        <a href="#" className="text-blue-600 hover:underline">Download Sample Template</a>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t space-x-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleUpload} disabled={!file} isLoading={isLoading}>Upload</Button>
                </div>
            </div>
        </div>
    );
};

export default UploadExcelModal;

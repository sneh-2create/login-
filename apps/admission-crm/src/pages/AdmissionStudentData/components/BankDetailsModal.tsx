import { useEffect, useState } from 'react';
import { Button, Input } from '@od-erp/ui';
import { useEditAdmissionStudentData } from '@od-erp/query';
import { AdmissionLead, BankDetails } from '@od-erp/types';
import { X, Landmark } from 'lucide-react';

interface BankDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const BankDetailsModal = ({ isOpen, onClose, student }: BankDetailsModalProps) => {
    const [bankDetails, setBankDetails] = useState<BankDetails>({
        bankName: '',
        branchName: '',
        ifscCode: '',
        accountNumber: '',
        studentName: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Mutation
    const editStudentMutation = useEditAdmissionStudentData();

    useEffect(() => {
        if (student && student.bankDetails) {
            setBankDetails({
                bankName: student.bankDetails.bankName || '',
                branchName: student.bankDetails.branchName || '',
                ifscCode: student.bankDetails.ifscCode || '',
                accountNumber: student.bankDetails.accountNumber || '',
                studentName: student.bankDetails.studentName || ''
            });
        } else if (student) {
            setBankDetails({
                bankName: '',
                branchName: '',
                ifscCode: '',
                accountNumber: '',
                studentName: ''
            });
        }
    }, [student, isOpen]);

    const handleChange = (field: keyof BankDetails, value: string) => {
        setBankDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!student) return;

        // Validation (mimicking Angular)
        if (!bankDetails.bankName || bankDetails.bankName.length < 2) {
            alert('Bank Name is required and must be at least 2 characters.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...student,
                bankDetails: bankDetails
            };

            await editStudentMutation.mutateAsync(payload);
            onClose();
        } catch (error) {
            console.error('Failed to update bank details:', error);
            alert('Failed to update bank details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Landmark className="mr-2 h-5 w-5 text-blue-600" />
                        Bank Details of {student.name}-{student.applicationNumber}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Input
                                label="Bank Name"
                                placeholder="Bank Name"
                                value={bankDetails.bankName}
                                onChange={(e) => handleChange('bankName', e.target.value)}
                            />
                        </div>
                        <div>
                            <Input
                                label="Branch Name"
                                placeholder="Branch Name"
                                value={bankDetails.branchName}
                                onChange={(e) => handleChange('branchName', e.target.value)}
                            />
                        </div>
                        <div>
                            <Input
                                label="IFSC Code"
                                placeholder="IFSC Code"
                                value={bankDetails.ifscCode}
                                onChange={(e) => handleChange('ifscCode', e.target.value)}
                            />
                        </div>
                        <div>
                            <Input
                                label="Account Number"
                                placeholder="Account Number"
                                value={bankDetails.accountNumber}
                                onChange={(e) => handleChange('accountNumber', e.target.value)}
                            />
                        </div>
                        <div>
                            <Input
                                label="Student Name"
                                placeholder="Student Name"
                                value={bankDetails.studentName}
                                onChange={(e) => handleChange('studentName', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                    >
                        {isLoading ? 'Saving...' : 'Edit'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BankDetailsModal;

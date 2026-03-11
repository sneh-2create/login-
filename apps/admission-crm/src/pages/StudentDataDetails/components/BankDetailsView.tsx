import { useEffect, useState } from 'react';
import { Button, Input } from '@od-erp/ui';
import { useEditAdmissionStudentData } from '@od-erp/query';
import { AdmissionLead, BankDetails } from '@od-erp/types';

interface BankDetailsViewProps {
    student: AdmissionLead;
}

const BankDetailsView = ({ student }: BankDetailsViewProps) => {
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
        if (student) {
            let bankData = student.bankDetails;
            
            // Handle legacy array format (backward compatibility with Angular)
            if (Array.isArray(bankData)) {
                bankData = bankData[0] || {};
            }
            
            // Initialize with existing data or empty strings
            if (bankData) {
                setBankDetails({
                    bankName: bankData.bankName || '',
                    branchName: bankData.branchName || '',
                    ifscCode: bankData.ifscCode || '',
                    accountNumber: bankData.accountNumber || '',
                    studentName: bankData.studentName || ''
                });
            } else {
                setBankDetails({
                    bankName: '',
                    branchName: '',
                    ifscCode: '',
                    accountNumber: '',
                    studentName: ''
                });
            }
        }
    }, [student]);

    const handleChange = (field: keyof BankDetails, value: string) => {
        setBankDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!student) return;

        // Full validation matching Angular implementation
        if (!bankDetails.bankName) {
            alert('Bank Name is required.');
            return;
        }
        
        if (bankDetails.bankName.length < 2) {
            alert('Minimum field length: 2');
            return;
        }
        
        if (bankDetails.bankName.length > 100) {
            alert('Maximum field length: 100');
            return;
        }
        
        // Pattern validation: alphanumeric + space, apostrophe, hyphen, dot
        const pattern = /^[a-zA-Z0-9 '-.]+$/;
        if (!pattern.test(bankDetails.bankName)) {
            alert('Only Alpha Numeric Required (letters, numbers, spaces, apostrophes, hyphens, and dots allowed)');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...student,
                bankDetails: bankDetails
            };

            await editStudentMutation.mutateAsync(payload);
            alert('Bank details updated successfully!');
        } catch (error) {
            console.error('Failed to update bank details:', error);
            alert('Failed to update bank details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
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

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`bg-primary hover:bg-primary/90 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};

export default BankDetailsView;

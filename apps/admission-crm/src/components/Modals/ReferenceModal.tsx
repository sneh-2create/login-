import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useEditAdmissionStudentData } from '@od-erp/query';
import { Button, Input } from '@od-erp/ui';
import StudentInfoBar from '../StudentInfoBar';

interface ReferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const ReferenceModal = ({ isOpen, onClose, student }: ReferenceModalProps) => {
    const [reference1, setReference1] = useState(student?.reference1 || '');
    const [reference2, setReference2] = useState(student?.reference2 || '');
    const [errors, setErrors] = useState<{ reference1?: string }>({});
    const editMutation = useEditAdmissionStudentData();

    // Sync state when student prop changes (fixes stale data issue)
    useEffect(() => {
        if (student) {
            setReference1(student.reference1 || '');
            setReference2(student.reference2 || '');
            setErrors({});
        }
    }, [student, isOpen]);

    const handleSave = async () => {
        // Validation
        if (!reference1.trim()) {
            setErrors({ reference1: 'Field required' });
            return;
        }

        setErrors({});

        try {
            await editMutation.mutateAsync({
                ...student,
                reference1: reference1.trim(),
                reference2: reference2.trim()
            });
            onClose();
        } catch (error) {
            // Error handling - could add error state here
            console.error('Failed to update reference:', error);
        }
    };

    const handleReset = () => {
        setReference1(student?.reference1 || '');
        setReference2(student?.reference2 || '');
        setErrors({});
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-end bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex justify-between items-center px-3 py-2 border-b bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">Reference</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Student Info Bar */}
                <StudentInfoBar student={student} />

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-3 py-2">
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between mb-0">
                            <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-gray-800">Reference</h4>
                                <button
                                    onClick={handleReset}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Reset"
                                >
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                isLoading={editMutation.isPending}
                            >
                                {editMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Reference 1 */}
                            <Input
                                label="Reference 1 *"
                                value={reference1}
                                onChange={(e) => {
                                    setReference1(e.target.value);
                                    if (errors.reference1) setErrors({});
                                }}
                                placeholder="Enter Reference1"
                                error={errors.reference1}
                            />

                            {/* Reference 2 */}
                            <Input
                                label="Reference 2"
                                value={reference2}
                                onChange={(e) => setReference2(e.target.value)}
                                placeholder="Enter Reference2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferenceModal;

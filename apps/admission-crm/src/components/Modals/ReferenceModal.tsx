import { X, Link2, RotateCw } from 'lucide-react';
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

    useEffect(() => {
        if (student) {
            setReference1(student.reference1 || '');
            setReference2(student.reference2 || '');
            setErrors({});
        }
    }, [student, isOpen]);

    const handleSave = async () => {
        if (!reference1.trim()) {
            setErrors({ reference1: 'Field required' });
            return;
        }
        setErrors({});
        try {
            await editMutation.mutateAsync({
                ...student,
                reference1: reference1.trim(),
                reference2: reference2.trim(),
            });
            onClose();
        } catch (error) {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden m-4">

                {/* ─── Modal Header ─── */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Link2 size={18} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">Reference</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Student Info Bar */}
                <StudentInfoBar student={student} />

                {/* ─── Form Card ─── */}
                <div className="p-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Link2 size={14} className="text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">Edit Reference</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleReset}
                                    className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                                    title="Reset"
                                >
                                    <RotateCw size={14} />
                                </button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSave}
                                    isLoading={editMutation.isPending}
                                >
                                    {editMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                                label="Reference 1 *"
                                value={reference1}
                                onChange={(e) => {
                                    setReference1(e.target.value);
                                    if (errors.reference1) setErrors({});
                                }}
                                placeholder="Enter Reference 1"
                                error={errors.reference1}
                            />
                            <Input
                                label="Reference 2"
                                value={reference2}
                                onChange={(e) => setReference2(e.target.value)}
                                placeholder="Enter Reference 2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferenceModal;

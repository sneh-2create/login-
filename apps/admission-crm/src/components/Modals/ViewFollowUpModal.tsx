import { useState, useMemo, useRef } from 'react';
import { useAdmissionFollowUps, useAddAdmissionFollowUp, useEditAdmissionFollowUp } from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';
import { X, MessageSquare, RotateCw, Check } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable, Button, Input, DatePicker } from '@od-erp/ui'; // Added Input, DatePicker
import { ColumnDef } from '@tanstack/react-table';
import StudentInfoBar from '../StudentInfoBar';

interface ViewFollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
    onSaveSuccess?: () => void;
}

const ViewFollowUpModal = ({ isOpen, onClose, student, onSaveSuccess }: ViewFollowUpModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';

    const { data: followUps, isLoading: isFollowUpsLoading } = useAdmissionFollowUps(entityId, student?._id || '');
    const addFollowUp = useAddAdmissionFollowUp();
    const editFollowUp = useEditAdmissionFollowUp();

    // Form State
    const [followUpDate, setFollowUpDate] = useState<Date>(new Date()); // Changed to Date
    const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
    const [remark, setRemark] = useState<string>('');
    const [editId, setEditId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('pending');
    const [remarkError, setRemarkError] = useState<string>('');
    // State for inline completion remarks
    const completionRemarksRef = useRef<Record<string, string>>({});

    const resetForm = () => {
        setFollowUpDate(new Date()); // Reset to Date
        setTime(format(new Date(), 'HH:mm'));
        setRemark('');
        setEditId(null);
        setStatus('pending');
        setRemarkError('');
    };

    // Time validation handler (matching Angular)
    const handleTimeChange = (newTime: string) => {
        setTime(newTime);
        
        if (newTime) {
            const currentTime = new Date();
            const selectedTime = new Date(followUpDate);
            const [hours, minutes] = newTime.split(':').map(Number);
            selectedTime.setHours(hours, minutes);

            if (selectedTime < currentTime) {
                alert("Can't set time before current time");
                // Reset to current time
                const currentHour = ('0' + currentTime.getHours()).slice(-2);
                const currentMinute = ('0' + currentTime.getMinutes()).slice(-2);
                setTime(`${currentHour}:${currentMinute}`);
            }
        }
    };

    // Remark validation (matching Angular: 2-100 chars, alphanumeric with ', -, .)
    const validateRemark = (value: string): boolean => {
        if (!value || value.trim().length < 2) {
            setRemarkError('Remark must be at least 2 characters');
            return false;
        }
        if (value.length > 100) {
            setRemarkError('Remark must not exceed 100 characters');
            return false;
        }
        // Pattern: alphanumeric with special chars (', -, .)
        const pattern = /^[a-zA-Z0-9\s',.-]+$/;
        if (!pattern.test(value)) {
            setRemarkError("Remark can only contain letters, numbers, and special characters (', -, .)");
            return false;
        }
        setRemarkError('');
        return true;
    };

    const handleRemarkChange = (value: string) => {
        setRemark(value);
        if (value) {
            validateRemark(value);
        } else {
            setRemarkError('');
        }
    };

    const handleMarkCompleted = async (row: any) => {
        const remark = completionRemarksRef.current[row._id] || 'completed';
        const payload: any = {
            ...row,
            status: 'completed',
            completionRemark: remark
        };
        try {
            await editFollowUp.mutateAsync(payload);
            // Clear local state for this row
            delete completionRemarksRef.current[row._id];
        } catch (error) {
            console.error('Failed to mark as completed', error);
        }
    };

    const handleSubmit = async () => {
        if (!student) return;

        // Validate remark before submission
        if (!validateRemark(remark)) {
            return;
        }

        const date = new Date(followUpDate);
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes);

        const payload: any = {
            studentData: student._id,
            applicationNumber: student.applicationNumber,
            counselorId: student.counselorId,
            counselorName: student.counselorName,
            counselorMobile: student.counselorMobile,
            counselorEmail: student.counselorEmail,
            followUpDate: date.toISOString(),
            followUpQuery: remark,
            entity: entityId,
            status: status
        };

        try {
            if (editId) {
                payload._id = editId;
                await editFollowUp.mutateAsync(payload);
            } else {
                await addFollowUp.mutateAsync(payload);
            }
            if (onSaveSuccess) onSaveSuccess();
            resetForm();
        } catch (error) {
            console.error('Failed to save follow up', error);
            // Ideally show a toast notification here
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            header: 'S.No',
            accessorFn: (_row, i) => i + 1,
        },
        {
            header: 'Counselor Name',
            accessorKey: 'counselorName',
        },
        {
            header: 'Created At',
            accessorKey: 'createdAt',
            cell: info => info.getValue() ? format(new Date(info.getValue() as string), 'dd/MMM/yyyy') : '-'
        },
        {
            header: 'Follow-Up Query',
            accessorKey: 'followUpQuery',
        },
        {
            header: 'Follow-Up Date',
            accessorKey: 'followUpDate',
            cell: info => {
                const date = new Date(info.getValue() as string);
                return (
                    <div>
                        {format(date, 'dd/MMM/yyyy')} <br />
                        {format(date, 'HH:mm')}
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => {
                const status = (info.getValue() as string)?.toLowerCase();
                return (
                    <span className={`px-2 py-1 rounded text-white text-xs ${status === 'pending' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {info.getValue() as string}
                    </span>
                );
            }
        },
        {
            header: 'Completion Remark',
            accessorKey: 'completionRemark',
            cell: info => {
                const isPending = info.row.original.status?.toLowerCase() === 'pending';
                if (isPending) {
                    return (
                        <textarea
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            rows={2}
                            placeholder="Enter completion remark..."
                            defaultValue={completionRemarksRef.current[info.row.original._id] || ''}
                            onChange={(e) => {
                                completionRemarksRef.current[info.row.original._id] = e.target.value;
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent row selection if any
                        />
                    );
                }
                return info.getValue() || '-';
            },
            size: 200
        },
        {
            header: 'Action',
            id: 'actions',
            cell: info => {
                const isPending = info.row.original.status?.toLowerCase() === 'pending';
                return (
                    <div className="flex gap-2">
                        {isPending && (
                            <button
                                onClick={() => handleMarkCompleted(info.row.original)}
                                className="p-1 rounded hover:bg-green-50 text-green-500 bg-green-50 border border-green-200"
                                title="Mark as Completed"
                            >
                                <Check size={16} />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ], []);

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col overflow-hidden m-4">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                            Follow Ups
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <StudentInfoBar student={student} />

                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                    {/* Schedule Follow-Up Form */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                                Schedule Follow-Up
                                {editId && <span className="text-sm font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Editing Mode</span>}
                            </h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={resetForm}
                                    className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full"
                                    title="Reset Form"
                                    disabled={!editId && followUps?.some((f: any) => f.status === 'pending')}
                                >
                                    <RotateCw size={18} />
                                </button>
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={addFollowUp.isPending || editFollowUp.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={!editId && followUps?.some((f: any) => f.status === 'pending')}
                                >
                                    {editId ? 'Update' : 'Save'}
                                </Button>
                            </div>
                        </div>

                        {!editId && followUps?.some((f: any) => f.status === 'pending') && (
                            <div className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-orange-700">
                                            A pending follow-up already exists. Please complete or edit the existing follow-up before scheduling a new one.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">FollowUp Date</label>
                                    <DatePicker
                                        value={followUpDate}
                                        onChange={(date: Date | null) => date && setFollowUpDate(date)}
                                        minDate={new Date()}
                                        className="w-full"
                                        disabled={!editId && followUps?.some((f: any) => f.status === 'pending')}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Time"
                                        type="time"
                                        value={time}
                                        onChange={(e) => handleTimeChange(e.target.value)}
                                        disabled={!editId && followUps?.some((f: any) => f.status === 'pending')}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                <textarea
                                    rows={5}
                                    value={remark}
                                    onChange={(e) => handleRemarkChange(e.target.value)}
                                    placeholder="Enter remark here..."
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 resize-none disabled:bg-gray-100 disabled:text-gray-500 ${
                                        remarkError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                    disabled={!editId && followUps?.some((f: any) => f.status === 'pending')}
                                />
                                {remarkError && (
                                    <p className="mt-1 text-sm text-red-600">{remarkError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Follow Ups List */}
                    <div className="flex-1">
                        {isFollowUpsLoading ? (
                            <div className="flex justify-center py-8">Loading...</div>
                        ) : followUps && followUps.length > 0 ? (
                            <DataTable columns={columns} data={followUps} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <MessageSquare size={48} className="mb-2 opacity-50" />
                                <span className="text-lg">No Follow Ups found!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFollowUpModal;

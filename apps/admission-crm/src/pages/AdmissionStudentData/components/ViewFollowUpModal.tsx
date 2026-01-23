import { useState, useMemo } from 'react';
import { useAdmissionFollowUps, useAddAdmissionFollowUp, useEditAdmissionFollowUp } from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';
import { X, MessageSquare, Edit2, RotateCw, Check } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable, Button } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';

interface ViewFollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const ViewFollowUpModal = ({ isOpen, onClose, student }: ViewFollowUpModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';

    const { data: followUps, isLoading: isFollowUpsLoading } = useAdmissionFollowUps(entityId, student?._id || '');
    const addFollowUp = useAddAdmissionFollowUp();
    const editFollowUp = useEditAdmissionFollowUp();

    // Form State
    const [followUpDate, setFollowUpDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
    const [remark, setRemark] = useState<string>('');
    const [editId, setEditId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('pending');

    const resetForm = () => {
        setFollowUpDate(new Date().toISOString().split('T')[0]);
        setTime(format(new Date(), 'HH:mm'));
        setRemark('');
        setEditId(null);
        setStatus('pending');
    };

    const handleEdit = (row: any) => {
        setEditId(row._id);
        const date = new Date(row.followUpDate);
        setFollowUpDate(date.toISOString().split('T')[0]);
        setTime(format(date, 'HH:mm'));
        setRemark(row.followUpQuery || '');
        setStatus(row.status || 'pending');
    };

    const handleMarkCompleted = async (row: any) => {
        const payload: any = {
            ...row,
            status: 'completed',
            completionRemark: 'completed'
        };
        try {
            await editFollowUp.mutateAsync(payload);
        } catch (error) {
            console.error('Failed to mark as completed', error);
        }
    };

    const handleSubmit = async () => {
        if (!student) return;

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
            cell: info => info.getValue() || '-'
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
                                className="p-1 rounded hover:bg-green-50 text-green-500"
                                title="Mark as Completed"
                            >
                                <Check size={16} />
                            </button>
                        )}
                        <button
                            disabled={!isPending}
                            onClick={() => handleEdit(info.row.original)}
                            className={`p-1 rounded transition-colors ${isPending ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
                            title="Edit FollowUp"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                );
            }
        }
    ], []);

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                            Follow Ups
                        </h2>
                        {/* Student Details Header */}
                        <div className="hidden md:flex flex-wrap gap-4 text-sm text-gray-600 border-l pl-4 ml-4">
                            <div>
                                <span className="font-semibold block text-xs uppercase text-gray-400">Name</span>
                                {student.name}
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-gray-400">Application Number</span>
                                {student.applicationNumber}
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-gray-400">Father Name</span>
                                {student.fatherName || '-'}
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-gray-400">School Name</span>
                                {student.course}
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-gray-400">Course</span>
                                {(student as any).stream || '-'}
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-gray-400">Stage</span>
                                {student.currentStage}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                    {/* Schedule Follow-Up Form */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                                Schedule Follow-Up
                                {editId && <span className="text-sm font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Editing Mode</span>}
                            </h4>
                            <div className="flex gap-2">
                                <button onClick={resetForm} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full" title="Reset Form">
                                    <RotateCw size={18} />
                                </button>
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={addFollowUp.isPending || editFollowUp.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {editId ? 'Update' : 'Save'}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">FollowUp Date</label>
                                    <input
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                <textarea
                                    rows={5}
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="Enter remark here..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                />
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

                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewFollowUpModal;

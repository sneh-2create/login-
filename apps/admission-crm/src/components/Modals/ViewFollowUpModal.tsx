import { useState, useMemo, useRef } from 'react';
import { useAdmissionFollowUps, useAddAdmissionFollowUp, useEditAdmissionFollowUp } from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';
import { X, MessageSquare, RotateCw, Check, CalendarClock, AlertTriangle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable, Button, DatePicker, TimePicker, TextArea } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import StudentInfoBar from '../StudentInfoBar';

interface ViewFollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
    onSaveSuccess?: () => void;
    inline?: boolean;
}

const ViewFollowUpModal = ({ isOpen, onClose, student, onSaveSuccess, inline = false }: ViewFollowUpModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';

    const { data: followUps, isLoading: isFollowUpsLoading } = useAdmissionFollowUps(entityId, student?._id || '');
    const addFollowUp = useAddAdmissionFollowUp();
    const editFollowUp = useEditAdmissionFollowUp();

    // Form State
    const [followUpDate, setFollowUpDate] = useState<Date>(new Date());
    const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
    const [remark, setRemark] = useState<string>('');
    const [editId, setEditId] = useState<string | null>(null);
    const [status] = useState<string>('pending');
    const [remarkError, setRemarkError] = useState<string>('');

    // Ref to collect per-row completion remarks without causing re-renders
    const completionRemarksRef = useRef<Record<string, string>>({});

    const resetForm = () => {
        setFollowUpDate(new Date());
        setTime(format(new Date(), 'HH:mm'));
        setRemark('');
        setEditId(null);
        setRemarkError('');
    };

    // Time validation: prevent selecting a past time on today
    const handleTimeChange = (newTime: string) => {
        if (newTime) {
            const currentTime = new Date();
            const selectedTime = new Date(followUpDate);
            const [hours, minutes] = newTime.split(':').map(Number);
            selectedTime.setHours(hours, minutes, 0, 0);
            if (selectedTime < currentTime) {
                alert("Can't set time before current time");
                const h = ('0' + currentTime.getHours()).slice(-2);
                const m = ('0' + currentTime.getMinutes()).slice(-2);
                setTime(`${h}:${m}`);
                return;
            }
        }
        setTime(newTime);
    };

    // Remark validation: 2–100 chars, alphanumeric + ', -, .
    const validateRemark = (value: string): boolean => {
        if (!value || value.trim().length < 2) {
            setRemarkError('Remark must be at least 2 characters');
            return false;
        }
        if (value.length > 100) {
            setRemarkError('Remark must not exceed 100 characters');
            return false;
        }
        const pattern = /^[a-zA-Z0-9\s',.-]+$/;
        if (!pattern.test(value)) {
            setRemarkError("Only letters, numbers and special characters (', -, .) are allowed");
            return false;
        }
        setRemarkError('');
        return true;
    };

    const handleRemarkChange = (value: string) => {
        setRemark(value);
        if (value) validateRemark(value);
        else setRemarkError('');
    };

    const handleMarkCompleted = async (row: any) => {
        const completionRemark = completionRemarksRef.current[row._id] || 'completed';
        const payload: any = { ...row, status: 'completed', completionRemark };
        try {
            await editFollowUp.mutateAsync(payload);
            delete completionRemarksRef.current[row._id];
        } catch (error) {
            console.error('Failed to mark as completed', error);
        }
    };

    const handleEditRow = (row: any) => {
        setEditId(row._id);
        setRemark(row.followUpQuery || '');
        setFollowUpDate(new Date(row.followUpDate));
        setTime(format(new Date(row.followUpDate), 'HH:mm'));
    };

    const handleSubmit = async () => {
        if (!student) return;
        if (!validateRemark(remark)) return;

        const date = new Date(followUpDate);
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);

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
            status,
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
        }
    };

    const hasPending = followUps?.some((f: any) => f.status?.toLowerCase() === 'pending');
    const isFormDisabled = !editId && hasPending;

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            header: '#',
            size: 48,
            accessorFn: (_row, i) => i + 1,
            cell: info => (
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{info.getValue() as number}</span>
            ),
        },
        {
            header: 'Counselor',
            accessorKey: 'counselorName',
            cell: info => (
                <span className="font-medium text-[var(--color-foreground)]">{info.getValue() as string || '-'}</span>
            ),
        },
        {
            header: 'Created',
            accessorKey: 'createdAt',
            cell: info => (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                    {info.getValue() ? format(new Date(info.getValue() as string), 'dd MMM yyyy') : '-'}
                </span>
            ),
        },
        {
            header: 'Follow-Up Query',
            accessorKey: 'followUpQuery',
            cell: info => (
                <span className="text-sm text-[var(--color-foreground)] line-clamp-2">{info.getValue() as string || '-'}</span>
            ),
        },
        {
            header: 'Follow-Up Date & Time',
            accessorKey: 'followUpDate',
            cell: info => {
                const date = new Date(info.getValue() as string);
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-[var(--color-foreground)]">{format(date, 'dd MMM yyyy')}</span>
                        <span className="text-xs text-[var(--color-muted-foreground)]">{format(date, 'HH:mm')}</span>
                    </div>
                );
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => {
                const val = (info.getValue() as string) || '';
                const isPending = val.toLowerCase() === 'pending';
                return (
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPending
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {val.charAt(0).toUpperCase() + val.slice(1)}
                    </span>
                );
            },
        },
        {
            header: 'Completion Remark',
            accessorKey: 'completionRemark',
            size: 200,
            cell: info => {
                const isPending = info.row.original.status?.toLowerCase() === 'pending';
                if (isPending) {
                    return (
                        <textarea
                            className="w-full px-2.5 py-1.5 text-xs border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-[var(--color-background)] text-[var(--color-foreground)] resize-none transition-colors placeholder:text-[var(--color-muted-foreground)]"
                            rows={2}
                            placeholder="Enter completion remark..."
                            defaultValue={completionRemarksRef.current[info.row.original._id] || ''}
                            onChange={(e) => {
                                completionRemarksRef.current[info.row.original._id] = e.target.value;
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    );
                }
                return (
                    <span className="text-sm text-[var(--color-muted-foreground)]">{(info.getValue() as string) || '-'}</span>
                );
            },
        },
        {
            header: 'Actions',
            id: 'actions',
            size: 90,
            cell: info => {
                const isPending = info.row.original.status?.toLowerCase() === 'pending';
                return (
                    <div className="flex items-center gap-1.5">
                        {isPending && (
                            <>
                                <button
                                    onClick={() => handleMarkCompleted(info.row.original)}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                                    title="Mark as Completed"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={() => handleEditRow(info.row.original)}
                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                                    title="Edit Follow-Up"
                                >
                                    <Pencil size={14} />
                                </button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ], []);

    if (!isOpen || !student) return null;

    const content = (
        <div className={inline ? 'space-y-5' : 'p-3 overflow-y-auto flex-1 flex flex-col gap-5'}>

            {/* ─── Schedule Follow-Up Card ─── */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm overflow-hidden">

                {/* Card Header */}
                <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <CalendarClock size={16} className="text-primary" />
                        </div>
                        <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Schedule Follow-Up</h4>
                        {editId && (
                            <span className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                <Pencil size={10} />
                                Editing
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetForm}
                            className="p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Reset Form"
                            disabled={isFormDisabled}
                        >
                            <RotateCw size={15} />
                        </button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            isLoading={addFollowUp.isPending || editFollowUp.isPending}
                            disabled={isFormDisabled}
                        >
                            {editId ? 'Update' : 'Save Follow-Up'}
                        </Button>
                    </div>
                </div>

                {/* Pending Warning */}
                {isFormDisabled && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border-b border-amber-100">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
                        <p className="text-sm text-amber-700">
                            A pending follow-up already exists. Please complete or edit the existing follow-up before scheduling a new one.
                        </p>
                    </div>
                )}

                {/* Form Fields */}
                <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Follow-Up Date</label>
                            <DatePicker
                                value={followUpDate}
                                onChange={(date: Date | null) => date && setFollowUpDate(date)}
                                minDate={new Date()}
                                className="w-full"
                                disabled={isFormDisabled}
                            />
                        </div>
                        <TimePicker
                            label="Follow-Up Time"
                            value={time}
                            onChange={handleTimeChange}
                            disabled={isFormDisabled}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <TextArea
                            label="Remark"
                            rows={5}
                            value={remark}
                            onChange={handleRemarkChange}
                            placeholder="Enter follow-up remarks here (2–100 characters)..."
                            error={remarkError}
                            disabled={isFormDisabled}
                        />
                        <div className="mt-1 flex justify-end">
                            <span className={`text-xs ${remark.length > 90 ? 'text-amber-500' : 'text-[var(--color-muted-foreground)]'}`}>
                                {remark.length}/100
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Follow-Up History Table ─── */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)]">
                    <MessageSquare size={15} className="text-[var(--color-muted-foreground)]" />
                    <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Follow-Up History</h4>
                    {followUps && followUps.length > 0 && (
                        <span className="ml-auto text-xs text-[var(--color-muted-foreground)] bg-[var(--color-background)] px-2 py-0.5 rounded-full">
                            {followUps.length} record{followUps.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {isFollowUpsLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-[var(--color-muted-foreground)]">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                        <span className="text-sm">Loading follow-ups...</span>
                    </div>
                ) : followUps && followUps.length > 0 ? (
                    <DataTable columns={columns} data={followUps} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-[var(--color-muted-foreground)]">
                        <div className="p-4 rounded-full bg-[var(--color-background)] border border-dashed border-[var(--color-border)] mb-3">
                            <MessageSquare size={32} className="opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-[var(--color-muted-foreground)]">No follow-ups yet</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Schedule the first follow-up using the form above.</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Inline mode — render content directly without modal chrome
    if (inline) {
        return content;
    }

    // Modal mode — full modal wrapper
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--color-card)] rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-2 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <MessageSquare size={18} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Follow Ups</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[var(--color-background)] rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <StudentInfoBar student={student} />

                {content}
            </div>
        </div>
    );
};

export default ViewFollowUpModal;

import { useState, useMemo } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useEditAdmissionStudentData, useAdmissionLeadLog, useViewAdmissionStudentData } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';
import { X, StickyNote, Calendar, Phone } from 'lucide-react';
import { Button, TextArea, HorizontalTabs } from '@od-erp/ui';
import StudentInfoBar from '../StudentInfoBar';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const VIEW_TABS = [
    { label: 'Table View', value: 'table' },
    { label: 'Board View', value: 'board' },
];

const NotesModal = ({ isOpen, onClose, student }: NotesModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [note, setNote] = useState('');
    const [viewMode, setViewMode] = useState<string>('table');

    // Fetch fresh student data to get timeline
    const { data: freshStudentData } = useViewAdmissionStudentData(student?._id || '');

    // Fetch API logs
    const { data: logsData, isLoading } = useAdmissionLeadLog({
        entity: entityId,
        session,
        studentData: student?._id,
        phone: student?.phone,
        pageSize: 100,
        pageNumber: 1,
    });

    // Combine timeline & API logs, filter for notes only, sort newest first
    const notesData = useMemo(() => {
        const studentTimeline = freshStudentData?.timeline || [];
        const apiLogs = logsData?.data || [];
        const combined = [...studentTimeline, ...apiLogs];
        const notes = combined.filter((item: any) => item.actionType === 'notes');
        return notes.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [freshStudentData, logsData]);

    const addNoteMutation = useEditAdmissionStudentData();

    const handleSave = async () => {
        if (!note.trim() || !student) return;
        const payload = {
            ...student,
            entity: entityId,
            session,
            timeline: [
                ...(student.timeline || []),
                { actionType: 'notes', date: Date.now(), remark: note },
            ],
        };
        try {
            await addNoteMutation.mutateAsync(payload);
            setNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const formatRemark = (text: string) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, index) =>
            urlRegex.test(part) ? (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                >
                    {part}
                </a>
            ) : (
                <span key={index}>{part}</span>
            )
        );
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden m-4">

                {/* ─── Modal Header ─── */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <StickyNote size={18} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
                        {notesData.length > 0 && (
                            <span className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                                {notesData.length} note{notesData.length !== 1 ? 's' : ''}
                            </span>
                        )}
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

                {/* ─── Scrollable Content ─── */}
                <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-4">

                    {/* Add Note Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <StickyNote size={14} className="text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">Add Note</h3>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSave}
                                isLoading={addNoteMutation.isPending}
                            >
                                Save Note
                            </Button>
                        </div>
                        <div className="p-3">
                            <TextArea
                                label="Note"
                                rows={3}
                                placeholder="Enter note details..."
                                value={note}
                                onChange={(val) => setNote(val)}
                            />
                            <div className="mt-1 flex justify-end">
                                <span className="text-xs text-gray-400">{note.length} chars</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes List Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* HorizontalTabs for view switching */}
                        <HorizontalTabs
                            tabs={VIEW_TABS}
                            activeTab={viewMode}
                            onTabChange={setViewMode}
                            fullWidth={false}
                            className="px-3 pt-1"
                        />

                        <div className="p-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                                    <span className="text-sm">Loading notes...</span>
                                </div>
                            ) : notesData.length > 0 ? (

                                viewMode === 'table' ? (
                                    /* ── Table View ── */
                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold w-12">#</th>
                                                    <th className="px-4 py-3 font-semibold w-44">Date & Time</th>
                                                    <th className="px-4 py-3 font-semibold">Note</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {notesData.map((item: any, index: number) => (
                                                    <tr key={item._id || index} className="hover:bg-gray-50/60 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-sm text-gray-700">
                                                                {item.date ? format(item.date, 'dd MMM yyyy') : '-'}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {item.date ? format(item.date, 'hh:mm a') : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                            {formatRemark(item.remark || '')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    /* ── Board View ── */
                                    <div className="relative pl-10 space-y-2">
                                        {/* Vertical timeline line */}
                                        <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

                                        {/* Timeline header */}
                                        <div className="flex items-center gap-2 mb-2 -ml-2">
                                            <div className="bg-primary/10 p-2 rounded-full border-4 border-white shadow-sm z-10">
                                                <Calendar size={16} className="text-primary" />
                                            </div>
                                            <span className="font-semibold text-gray-700 bg-white px-3 py-0.5 rounded-full shadow-sm text-sm border border-gray-100">
                                                Timeline
                                            </span>
                                            <span className="text-xs text-gray-400">{notesData.length} entries</span>
                                        </div>

                                        {notesData.map((item: any, index: number) => (
                                            <div key={item._id || index} className="relative">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-10 top-3 w-7 h-7 rounded-full bg-primary border-4 border-white shadow-sm flex items-center justify-center z-10">
                                                    <StickyNote size={12} className="text-white" />
                                                </div>

                                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                                    {/* Card header */}
                                                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50/70 border-b border-gray-100">
                                                        <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                                            Notes
                                                        </span>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                {item.date ? format(item.date, 'dd MMM yyyy') : '-'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">
                                                                {item.date ? format(item.date, 'hh:mm a') : '-'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="px-3 py-2">
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Remark</p>
                                                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                            {formatRemark(item.remark || '')}
                                                        </div>
                                                        {item.callDetails?.callRecordingLink && (
                                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                                <a
                                                                    href={item.callDetails.callRecordingLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium"
                                                                >
                                                                    <Phone size={12} />
                                                                    Download Recording
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                /* ── Empty State ── */
                                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                                    <div className="p-4 rounded-full bg-gray-50 border border-dashed border-gray-200 mb-3">
                                        <StickyNote size={28} className="opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No notes yet</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Add the first note using the form above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesModal;

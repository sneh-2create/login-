import { useState, useMemo } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useAdmissionLeadLog, useClickToCall } from '@od-erp/query';
import { useViewAdmissionStudentData } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';
import { X, PhoneCall, Download, Phone } from 'lucide-react';
import { Button, HorizontalTabs } from '@od-erp/ui';
import StudentInfoBar from '../StudentInfoBar';

interface CallsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const VIEW_TABS = [
    { label: 'Table View', value: 'table' },
    { label: 'Board View', value: 'board' },
];

const CallsModal = ({ isOpen, onClose, student }: CallsModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const [viewMode, setViewMode] = useState<string>('table');

    const myOperatorId = localStorage.getItem('myOperatorId') || '';

    const { data: studentData } = useViewAdmissionStudentData(student?._id || '');

    const { data: leadLogsData, isLoading } = useAdmissionLeadLog({
        entity: entityId,
        session,
        phone: student?.phone,
        pageSize: 100,
        pageNumber: 1,
    });

    const clickToCallMutation = useClickToCall();

    const callsData = useMemo(() => {
        const timelineData = studentData?.timeline || [];
        const apiLogsData = leadLogsData?.data || [];
        const combinedData = [...timelineData, ...apiLogsData];
        const filteredData = combinedData.filter((item: any) => item.source === 'myOperator');
        return filteredData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [studentData, leadLogsData]);

    const hasClickToCallPermission = permissions.includes('peerToPeerCallForAdmission');

    const handleClickToCall = () => {
        if (!student) return;
        clickToCallMutation.mutate(
            { entity: entityId, session, phone: student.phone, applicationNumber: student.applicationNumber, myOperatorId },
            { onError: (error: any) => console.error('Failed to initiate call:', error) }
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
                            <PhoneCall size={18} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">Calls</h2>
                        {callsData.length > 0 && (
                            <span className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                                {callsData.length} call{callsData.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasClickToCallPermission && (
                            <Button
                                variant="primary"
                                onClick={handleClickToCall}
                                isLoading={clickToCallMutation.isPending}
                            >
                                <PhoneCall size={14} className="mr-1.5" />
                                {clickToCallMutation.isPending ? 'Calling...' : 'Click To Call'}
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Student Info Bar */}
                <StudentInfoBar student={student} />

                {/* ─── Scrollable Content ─── */}
                <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* HorizontalTabs for view switching */}
                        <HorizontalTabs
                            tabs={VIEW_TABS}
                            activeTab={viewMode}
                            onTabChange={setViewMode}
                            className="px-3 pt-1"
                        />

                        <div className="p-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                                    <span className="text-sm">Loading calls...</span>
                                </div>
                            ) : callsData.length > 0 ? (

                                viewMode === 'table' ? (
                                    /* ── Table View ── */
                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold w-12">#</th>
                                                    <th className="px-4 py-3 font-semibold w-44">Date & Time</th>
                                                    <th className="px-4 py-3 font-semibold">Remark</th>
                                                    <th className="px-4 py-3 font-semibold w-28">Recording</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {callsData.map((log: any, index: number) => (
                                                    <tr key={log._id || index} className="hover:bg-gray-50/60 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-sm text-gray-700">
                                                                {log.date ? format(log.date, 'dd MMM yyyy') : '-'}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {log.date ? format(log.date, 'hh:mm a') : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                            {log.remark || '-'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {log.callDetails?.callRecordingLink ? (
                                                                <a
                                                                    href={log.callDetails.callRecordingLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                                                >
                                                                    <Download size={13} />
                                                                    Download
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-gray-300">—</span>
                                                            )}
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

                                        {callsData.map((log: any, index: number) => (
                                            <div key={log._id || index} className="relative">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-10 top-3 w-7 h-7 rounded-full bg-primary border-4 border-white shadow-sm flex items-center justify-center z-10">
                                                    <Phone size={12} className="text-white" />
                                                </div>

                                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                                    {/* Card header */}
                                                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50/70 border-b border-gray-100">
                                                        <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                                            Call
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            {log.callDetails?.callRecordingLink && (
                                                                <a
                                                                    href={log.callDetails.callRecordingLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                                                                    title="Download Recording"
                                                                >
                                                                    <Download size={12} />
                                                                    Recording
                                                                </a>
                                                            )}
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {log.date ? format(log.date, 'dd MMM yyyy') : '-'}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {log.date ? format(log.date, 'hh:mm a') : '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="px-3 py-2">
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Remark</p>
                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                            {log.remark || 'No remark'}
                                                        </p>
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
                                        <PhoneCall size={28} className="opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No calls recorded</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Call logs from myOperator will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallsModal;

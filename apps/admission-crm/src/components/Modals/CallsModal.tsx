import { useState, useMemo } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useAdmissionLeadLog, useClickToCall } from '@od-erp/query';
import { useViewAdmissionStudentData } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';
import { X, PhoneCall, Download } from 'lucide-react';
import StudentInfoBar from '../StudentInfoBar';

interface CallsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const CallsModal = ({ isOpen, onClose, student }: CallsModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

    // Get myOperatorId from localStorage
    const myOperatorId = localStorage.getItem('myOperatorId') || '';

    // Fetch student timeline data
    const { data: studentData } = useViewAdmissionStudentData(student?._id || '');

    // Fetch API logs
    const { data: leadLogsData, isLoading } = useAdmissionLeadLog({
        entity: entityId,
        session,
        phone: student?.phone,
        pageSize: 100,
        pageNumber: 1
    });

    // Click to call mutation
    const clickToCallMutation = useClickToCall();

    // Combine data from both sources and filter by source 'myOperator'
    const callsData = useMemo(() => {
        const timelineData = studentData?.timeline || [];
        const apiLogsData = leadLogsData?.data || [];
        
        // Concatenate both sources
        const combinedData = [...timelineData, ...apiLogsData];
        
        // Filter by source 'myOperator' (matching Angular logic)
        const filteredData = combinedData.filter((item: any) => item.source === 'myOperator');
        
        // Sort by date (newest first)
        return filteredData.sort((a: any, b: any) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
        });
    }, [studentData, leadLogsData]);

    // Check permission
    const hasClickToCallPermission = permissions.includes('peerToPeerCallForAdmission');

    // Handle click to call
    const handleClickToCall = () => {
        if (!student) return;

        const formData = {
            entity: entityId,
            session,
            phone: student.phone,
            applicationNumber: student.applicationNumber,
            myOperatorId
        };

        clickToCallMutation.mutate(formData, {
            onSuccess: () => {
                // Call initiated successfully
                // Success is handled by query invalidation
            },
            onError: (error: any) => {
                console.error('Failed to initiate call:', error);
            }
        });
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden m-4">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <PhoneCall size={24} className="text-blue-600" />
                        Calls
                    </h2>
                    <div className="flex items-center gap-3">
                        {/* Click To Call Button */}
                        {hasClickToCallPermission && (
                            <button
                                onClick={handleClickToCall}
                                disabled={clickToCallMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PhoneCall size={16} />
                                {clickToCallMutation.isPending ? 'Calling...' : 'Click To Call'}
                            </button>
                        )}
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Student Info Bar */}
                <StudentInfoBar student={student} />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">

                    {/* View Toggles */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[300px]">
                        <div className="flex border-b px-4 py-2 bg-gray-50 cursor-pointer">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`text-sm font-semibold px-2 pb-2 -mb-2.5 transition-colors duration-200 outline-none ${viewMode === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Table View
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`ml-4 text-sm font-semibold px-2 pb-2 -mb-2.5 transition-colors duration-200 outline-none ${viewMode === 'board' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Board View
                            </button>
                        </div>

                        <div className="p-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading calls...</div>
                            ) : callsData.length ? (
                                viewMode === 'table' ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-blue-900 text-white font-medium">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-md">Index</th>
                                                    <th className="px-4 py-3">Call Date</th>
                                                    <th className="px-4 py-3 rounded-tr-md">Call Remark</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {callsData.map((log: any, index: number) => (
                                                    <tr key={log._id || index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
                                                        <td className="px-4 py-3 font-semibold text-gray-700">
                                                            {log.date ? format(log.date, 'dd/MM/yyyy - hh:mm a') : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            <div>{log.remark || '-'}</div>
                                                            {log.callDetails?.callRecordingLink && (
                                                                <div className="mt-2 flex flex-col gap-1">
                                                                    <span className="text-xs font-semibold text-gray-500">Recording Link:</span>
                                                                    <a
                                                                        href={log.callDetails.callRecordingLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs gap-1"
                                                                    >
                                                                        <PhoneCall size={14} />
                                                                        <span>Download</span>
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {callsData.map((log: any, index: number) => (
                                            <div key={log._id || index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-gray-600">
                                                            {log.date ? format(log.date, 'dd/MM/yyyy') : '-'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {log.date ? format(log.date, 'hh:mm a') : ''}
                                                        </span>
                                                    </div>
                                                    {log.callDetails?.callRecordingLink && (
                                                        <a
                                                            href={log.callDetails.callRecordingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-500 hover:text-blue-600"
                                                            title="Download Recording"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="border-t pt-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <PhoneCall size={16} className="text-blue-600" />
                                                        <span className="text-xs font-semibold text-gray-700">Call</span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-800 mb-1">Remark</div>
                                                    <p className="text-sm text-gray-700">
                                                        {log.remark || 'No remark'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12 text-gray-500 font-medium text-sm">
                                    No Records found !
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

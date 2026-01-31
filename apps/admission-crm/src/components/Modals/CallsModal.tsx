import { useState } from 'react';
import { AdmissionLead, AdmissionLeadLog } from '@od-erp/types';
import { useAdmissionLeadLog } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';
import { X, PhoneCall, Download } from 'lucide-react';
import { Card } from '@od-erp/ui';

interface CallsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const CallsModal = ({ isOpen, onClose, student }: CallsModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

    const { data: leadLogsData, isLoading } = useAdmissionLeadLog({
        entity: entityId,
        session,
        phone: student?.phone, // Fetch logs by phone
        pageSize: 100,
        pageNumber: 1
    });

    // Filter for logs that have call details
    // Assuming 'callDetails' presence defines a call log, or specific callStatus
    const callsData = leadLogsData?.data?.filter(log => log.callDetails) || [];

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <PhoneCall size={24} className="text-blue-600" />
                        Calls
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Student Info Bar */}
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center text-sm">
                    <div className="flex gap-6">
                        <div>
                            <span className="text-gray-500 block text-xs">Name</span>
                            <span className="font-semibold text-gray-800">{student.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Application Number</span>
                            <span className="font-semibold text-gray-800">{student.applicationNumber || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Phone</span>
                            <span className="font-semibold text-gray-800">{student.phone}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Course</span>
                            <span className="font-semibold text-gray-800">{student.course || 'NA'}</span>
                        </div>
                    </div>
                </div>

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
                                                    <th className="px-4 py-3">Call Remark</th>
                                                    <th className="px-4 py-3 rounded-tr-md text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {callsData.map((log: AdmissionLeadLog, index: number) => (
                                                    <tr key={log._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
                                                        <td className="px-4 py-3 font-semibold text-gray-700">
                                                            {log.date ? format(log.date, 'dd/MM/yyyy - hh:mm a') : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 max-w-lg">
                                                            {log.remark || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {log.callDetails?.callRecordingLink ? (
                                                                <a
                                                                    href={log.callDetails.callRecordingLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex flex-col items-center text-blue-600 hover:text-blue-800 text-xs gap-1"
                                                                >
                                                                    <span className="font-semibold text-[10px] text-gray-500 uppercase">Recording Link</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <PhoneCall size={14} />
                                                                        <span>Download</span>
                                                                    </div>
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs italic">No Recording</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {callsData.map((log: AdmissionLeadLog) => (
                                            <Card key={log._id} className="p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        {log.date ? format(log.date, 'dd MMM yyyy') : '-'}
                                                    </span>
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
                                                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                                                    {log.remark || 'No remark'}
                                                </p>
                                                <div className="mt-3 pt-3 border-t text-xs text-gray-500 flex justify-between">
                                                    <span>{log.date ? format(log.date, 'hh:mm a') : ''}</span>
                                                    {log.counselorName && <span>By: {log.counselorName}</span>}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12 text-blue-500 font-medium text-sm">
                                    No Call Records Found !
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

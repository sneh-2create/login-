import { format } from 'date-fns';
import { X, Clock, Circle } from 'lucide-react';
import { useAdmissionLeadLogs } from '@od-erp/query'; // Import the new hook (assuming it's exported from admission or checking where it comes from)
import { useAppSelector } from '@od-erp/store';
import { useMemo } from 'react';

import { admissionLead } from '@od-erp/types';

interface TimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: admissionLead | null;
}

const TimelineModal = ({ isOpen, onClose, student }: TimelineModalProps) => {
    // Get session and entity from store
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';

    // Create payload for query
    const queryPayload = useMemo(() => ({
        entity: entityId,
        session: session,
        pageNumber: 1,
        pageSize: 100, // Fetch recent logs
        // Match Angular: filter by phone
        phone: student?.phone || '',
        search: ''
    }), [entityId, session, student]);

    const { data: response, isLoading } = useAdmissionLeadLogs(queryPayload);

    // Merge local timeline and fetched logs, then sort
    const timelineData = useMemo(() => {
        const localTimeline = student?.timeline || [];
        const fetchedLogs = response?.data || [];

        // Combine arrays
        const combined = [...localTimeline, ...fetchedLogs];

        // Sort by date descending (newest first)
        return combined.sort((a: any, b: any) => {
            const dateA = a.date || a.createdAt || 0;
            const dateB = b.date || b.createdAt || 0;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    }, [student?.timeline, response?.data]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-blue-600" />
                        Student Timeline
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : !timelineData || timelineData.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No timeline events found.
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                            {timelineData.map((event: any, index: number) => (
                                <div key={index} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-1 bg-white">
                                        <Circle className="h-4 w-4 text-blue-500 fill-blue-100" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {event.date ? format(new Date(event.date), 'dd MMM yyyy, hh:mm a') : '-'}
                                        </span>
                                        <h3 className="text-sm font-bold text-gray-800 mt-1">
                                            {event.status || 'Status Change'}
                                        </h3>
                                        {event.remark && (
                                            <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                                                {event.remark}
                                            </p>
                                        )}
                                        {event.callDetails && (
                                            <div className="mt-1 text-xs text-blue-600">
                                                Call: {event.callDetails.callStatus} ({event.callDetails.callDuration}s)
                                            </div>
                                        )}
                                        {event.counselorName && (
                                            <div className="mt-1 text-xs text-gray-400">
                                                by {event.counselorName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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

export default TimelineModal;

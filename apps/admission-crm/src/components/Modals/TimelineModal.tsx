import { format } from 'date-fns';
import { X, Clock, Building2, User, MessageSquare, FileText, Plane, Phone, Printer } from 'lucide-react';
import { useAdmissionLeadLog } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { useMemo } from 'react';

import { AdmissionLead } from '@od-erp/types';

interface TimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
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

    const { data: response, isLoading } = useAdmissionLeadLog(queryPayload);

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

    // Helper function to get icon and color based on action type or source
    const getEventIcon = (event: any) => {
        // Check actionType first
        if (event.actionType) {
            switch (event.actionType) {
                case 'instituteAction':
                    return { icon: Building2, color: 'text-white', bgColor: 'bg-blue-100', label: 'Institute' };
                case 'userAction':
                    return { icon: User, color: 'text-white', bgColor: 'bg-green-100', label: 'User' };
                case 'communication':
                    return { icon: MessageSquare, color: 'text-white', bgColor: 'bg-gray-100', label: 'Communication' };
                case 'notes':
                    return { icon: FileText, color: 'text-white', bgColor: 'bg-purple-100', label: 'Notes' };
                default:
                    return { icon: Clock, color: 'text-white', bgColor: 'bg-blue-100', label: 'Event' };
            }
        }
        
        // Check source if no actionType
        if (event.source) {
            switch (event.source) {
                case 'visit':
                    return { icon: Plane, color: 'text-orange-500', bgColor: 'bg-orange-100', label: 'Visit' };
                case 'myOperator':
                    return { icon: Phone, color: 'text-indigo-500', bgColor: 'bg-indigo-100', label: 'Call' };
                default:
                    return { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Event' };
            }
        }

        return { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Event' };
    };

    // Helper function to render remark with clickable URLs
    const renderRemark = (remark: string) => {
        if (!remark) return null;
        
        // Replace http:// with https:// and detect URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const sanitizedRemark = remark.replace(/http:\/\//g, 'https://');
        
        const parts = sanitizedRemark.split(urlRegex);
        
        return (
            <p className="text-sm text-gray-600 rounded">
                {parts.map((part, idx) => {
                    if (part.match(urlRegex)) {
                        return (
                            <a
                                key={idx}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {part}
                            </a>
                        );
                    }
                    return <span key={idx}>{part}</span>;
                })}
            </p>
        );
    };

    // Handle print timeline
    const handlePrint = () => {
        if (!student || !timelineData) return;
        
        // Store data in localStorage for print page
        localStorage.setItem('print_timeline_data', JSON.stringify(timelineData));
        localStorage.setItem('print_student_data', JSON.stringify(student));
        
        // Open print page in new window
        window.open('/admission/print/open/studentTimeline', '_blank');
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden m-4">
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-primary" />
                        Timeline for {student.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                            disabled={!timelineData || timelineData.length === 0}
                        >
                            <Printer size={16} />
                            Print Timeline
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-3 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : !timelineData || timelineData.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No Records found !
                        </div>
                    ) : (
                        <div className="relative pl-16">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            
                            {timelineData.map((event: any, index: number) => {
                                const { icon: Icon, color, label } = getEventIcon(event);
                                
                                return (
                                    <div key={index} className="relative mb-8 last:mb-0">
                                        {/* Circular Icon Badge */}
                                        <div className="absolute -left-16 top-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-sm" style={{ backgroundColor: `${color.replace('text-', 'bg-').replace('-500', '-50')}` }}>
                                            <Icon className={`h-5 w-5 ${color}`} />
                                        </div>

                                        {/* Date and Time */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-gray-100 px-3 py-1 rounded text-xs font-medium text-gray-700">
                                                {event.date ? format(new Date(event.date), 'dd/MM/yyyy') : '-'}
                                            </div>
                                            <div className="bg-gray-100 px-3 py-1 rounded text-xs font-medium text-gray-700">
                                                {event.date ? format(new Date(event.date), 'hh:mm a') : '-'}
                                            </div>
                                            <span className={`text-xs font-medium ${color}`}>
                                                {label}
                                            </span>
                                        </div>

                                        {/* Timeline Box */}
                                        <div className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                                            {/* Box Content */}
                                            <div>
                                                {/* Remark Header and User Name */}
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-bold text-gray-800">Remark</div>
                                                    <div className="text-sm font-bold text-gray-800 capitalize">
                                                        {event.userName || event.counselorName || ''}
                                                    </div>
                                                </div>

                                                {/* Remark Content */}
                                                {event.remark && renderRemark(event.remark)}

                                                {/* Call Recording Link */}
                                                {event.callDetails && event.callDetails.callRecordingLink && event.callDetails.callRecordingLink !== '' && (
                                                    <div className="flex flex-col mt-2">
                                                        <label className="text-xs font-medium text-gray-600 mb-1">Recording Link:</label>
                                                        <a
                                                            href={event.callDetails.callRecordingLink.replace('http://', 'https://')}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download="audio_file.mp3"
                                                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline cursor-pointer"
                                                            title="View Recording"
                                                        >
                                                            <Phone className="h-4 w-4" />
                                                            Download
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimelineModal;

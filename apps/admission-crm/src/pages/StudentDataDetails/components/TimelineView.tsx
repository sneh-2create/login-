import { useMemo, useState } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useAdmissionLeadLog } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';
import { Clock, User, MessageSquare, Printer } from 'lucide-react';

interface TimelineViewProps {
    student: AdmissionLead;
}

type FilterType = 'all' | 'visit' | 'myOperator' | 'communication' | 'notes';
type ViewType = 'board' | 'table';

const TimelineView = ({ student }: TimelineViewProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = student?.session || '';
    
    // State for filtering and view
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [viewType, setViewType] = useState<ViewType>('board');
    
    // Fetch timeline data
    const timelineQueryPayload = useMemo(() => {
        if (!student) return null;
        return {
            entity: entityId,
            session: session,
            pageNumber: 1,
            pageSize: 100,
            phone: student.phone || '',
            search: ''
        };
    }, [entityId, session, student]);
    
    const { data: timelineResponse, isLoading } = useAdmissionLeadLog(
        timelineQueryPayload || { entity: '', session: '', pageNumber: 1, pageSize: 0 }
    );
    
    const timelineData = useMemo(() => {
        const localTimeline = student?.timeline || [];
        const fetchedLogs = timelineResponse?.data || [];
        const combined = [...localTimeline, ...fetchedLogs];
        
        return combined.sort((a: any, b: any) => {
            const dateA = a.date || a.createdAt || 0;
            const dateB = b.date || b.createdAt || 0;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    }, [student, timelineResponse]);
    
    // Filter timeline based on selected filter
    const filteredTimeline = useMemo(() => {
        if (selectedFilter === 'all') return timelineData;
        
        if (selectedFilter === 'notes' || selectedFilter === 'communication') {
            return timelineData.filter((item: any) => item.actionType === selectedFilter);
        }
        
        // visit, myOperator
        return timelineData.filter((item: any) => item.source === selectedFilter);
    }, [timelineData, selectedFilter]);
    
    // Handle print
    const handlePrint = () => {
        if (!student || !timelineData) return;
        
        localStorage.setItem('print_timeline_data', JSON.stringify(timelineData));
        localStorage.setItem('print_student_data', JSON.stringify(student));
        window.open('/admission/print/open/studentTimeline', '_blank');
    };
    
    if (isLoading) {
        return (
            <div className="p-8">
                <div className="text-center text-[var(--color-muted-foreground)]">Loading timeline...</div>
            </div>
        );
    }
    
    return (
        <div>
            <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Timeline for {student.name}</h2>
            
            {/* Filter Tabs */}
            <div className="mb-4 border-b border-[var(--color-border)]">
                <div className="flex gap-1">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'visit', label: 'Visit' },
                        { id: 'myOperator', label: 'Calls' },
                        { id: 'communication', label: 'Communication' },
                        { id: 'notes', label: 'Notes' }
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedFilter(filter.id as FilterType)}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                                selectedFilter === filter.id
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* View Toggle and Print Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 bg-[var(--color-background)] rounded-lg p-1">
                    <button
                        onClick={() => setViewType('board')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewType === 'board'
                                ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                        }`}
                    >
                        Board View
                    </button>
                    <button
                        onClick={() => setViewType('table')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewType === 'table'
                                ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                        }`}
                    >
                        Table View
                    </button>
                </div>
                
                {viewType === 'board' && (
                    <button
                        onClick={handlePrint}
                        disabled={!filteredTimeline || filteredTimeline.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Printer size={16} />
                        Print Timeline
                    </button>
                )}
            </div>
            
            {filteredTimeline.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-muted-foreground)]">
                    No timeline events found
                </div>
            ) : viewType === 'board' ? (
                // Board View
                <div className="space-y-4">
                    {filteredTimeline.map((event: any, index: number) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Clock size={20} className="text-blue-600" />
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-semibold text-[var(--color-foreground)]">
                                            {event.actionType === 'instituteAction' && 'Institute'}
                                            {event.actionType === 'userAction' && 'User'}
                                            {event.actionType === 'communication' && 'Communication'}
                                            {event.actionType === 'notes' && 'Notes'}
                                            {!event.actionType && event.source === 'visit' && 'Visit'}
                                            {!event.actionType && event.source === 'myOperator' && 'Call'}
                                            {!event.actionType && !event.source && (event.stage || event.currentStage || 'Event')}
                                        </div>
                                        <div className="text-sm text-[var(--color-muted-foreground)]">
                                            {event.date || event.createdAt 
                                                ? format(new Date(event.date || event.createdAt), 'dd MMM yyyy, hh:mm a')
                                                : '-'
                                            }
                                        </div>
                                    </div>
                                </div>
                                
                                {event.remark && (
                                    <div className="text-sm text-[var(--color-foreground)] bg-[var(--color-background)] p-3 rounded-lg">
                                        <MessageSquare size={14} className="inline mr-2 text-[var(--color-muted-foreground)]" />
                                        {event.remark}
                                    </div>
                                )}
                                
                                {event.userName && (
                                    <div className="text-xs text-[var(--color-muted-foreground)] mt-2">
                                        <User size={12} className="inline mr-1" />
                                        {event.userName}
                                    </div>
                                )}
                                
                                {event.counselorName && (
                                    <div className="text-xs text-[var(--color-muted-foreground)] mt-2">
                                        <User size={12} className="inline mr-1" />
                                        {event.counselorName}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Table View
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Action Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                            {filteredTimeline.map((event: any, index: number) => (
                                <tr key={index} className="hover:bg-[var(--color-background)]">
                                    <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                                        {event.date || event.createdAt 
                                            ? format(new Date(event.date || event.createdAt), 'dd/MM/yyyy - hh:mm a')
                                            : '-'
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                                        {event.actionType === 'instituteAction' && 'Institute'}
                                        {event.actionType === 'userAction' && 'User'}
                                        {event.actionType === 'communication' && 'Communication'}
                                        {event.actionType === 'notes' && 'Notes'}
                                        {!event.actionType && event.source === 'visit' && 'Visit'}
                                        {!event.actionType && event.source === 'myOperator' && 'Call'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                                        {event.remark || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TimelineView;

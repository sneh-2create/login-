import { useState, useMemo } from 'react';
import { AdmissionLead } from '@od-erp/types';
import { useAddAdmissionLeadLog, useAdmissionLeadLog } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';
import { X, User, Phone, MessageSquare, StickyNote, Building, Calendar } from 'lucide-react';
import { Button, TextArea } from '@od-erp/ui';
import StudentInfoBar from '../StudentInfoBar';

interface VisitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const VisitsModal = ({ isOpen, onClose, student }: VisitsModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    
    const [remark, setRemark] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

    const { data: logsData, isLoading } = useAdmissionLeadLog({
        entity: entityId,
        session,
        studentData: student?._id,
        phone: student?.phone,
        pageSize: 100,
        pageNumber: 1
    });

    const visitsData = useMemo(() => {
        if (!logsData?.data) return [];
        return logsData.data.filter((log: any) => log.source === 'visit');
    }, [logsData]);

    const addVisitMutation = useAddAdmissionLeadLog();

    const handleSave = async () => {
        if (!remark.trim() || !student) return;

        // Duplicate Check Logic (Angular Parity)
        const hasExistingVisits = (visitsData?.length || 0) > 0;
        const status = hasExistingVisits ? 'duplicate' : 'converted';
        const tags = hasExistingVisits ? ['Duplicate'] : undefined;

        const payload = {
            name: student.name,
            dob: student.dob,
            course: student.course,
            stream: student.stream,
            phone: student.phone,
            email: student.email,
            source: 'visit',
            sourceId: student.applicationNumber,
            remark,
            counselorId: student.counselorId,
            counselorName: (student as any).counselorName, 
            counselorMobile: (student as any).counselorMobile,
            counselorEmail: (student as any).counselorEmail,
            studentData: student._id,
            entity: entityId, // Ensure entity is sent
            session, // Ensure session is sent
            status,
            tags,
            visitDate: Date.now()
        };

        try {
            await addVisitMutation.mutateAsync(payload as any);
            setRemark('');
        } catch (error) {
            console.error('Failed to add visit:', error);
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
            ) : part
        );
    };

    const renderTimelineIcon = (visit: any) => {
        if (visit.actionType === 'instituteAction') return <Building size={14} className="text-white" />;
        if (visit.actionType === 'userAction') return <User size={14} className="text-white" />;
        if (visit.actionType === 'communication') return <MessageSquare size={14} className="text-white" />;
        if (visit.actionType === 'notes') return <StickyNote size={14} className="text-white" />;
        
        // Fallback or source-based icons
        if (visit.source === 'visit') return <User size={14} className="text-white" />; // Walk icon replacement
        if (visit.source === 'myOperator') return <Phone size={14} className="text-white" />;
        
        return <User size={14} className="text-white" />;
    };

    const getIconColor = (_: any) => {
         return 'bg-primary';
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden m-4">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">Visits</h2>
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Total Visits: {visitsData?.length || 0}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Student Info Bar */}
                <StudentInfoBar student={student} />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                    {/* Add Visit Form */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Add Visit</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSave}
                                isLoading={addVisitMutation.isPending}
                                className="w-24"
                            >
                                Save
                            </Button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <TextArea
                                label="Remark *"
                                rows={3}
                                placeholder="Enter visit remarks..."
                                value={remark}
                                onChange={(val) => setRemark(val)}
                            />
                        </div>
                    </div>

                    {/* Visits List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[300px]">
                        <div className="flex border-b px-4 py-2 bg-gray-50 cursor-pointer">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`text-sm font-semibold px-4 py-2 rounded-md transition-colors duration-200 outline-none ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                Table View
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`ml-2 text-sm font-semibold px-4 py-2 rounded-md transition-colors duration-200 outline-none ${viewMode === 'board' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                Board View
                            </button>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading visits...</div>
                            ) : visitsData?.length ? (
                                viewMode === 'table' ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Sr.no</th>
                                                    <th className="px-4 py-3 font-semibold">Date</th>
                                                    <th className="px-4 py-3 font-semibold">Remark</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {visitsData.map((visit: any, index: number) => (
                                                    <tr key={visit._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 text-gray-500 w-16">{index + 1}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 w-48">
                                                            <div className="font-medium text-gray-900">{visit.date ? format(visit.date, 'dd/MM/yyyy') : '-'}</div>
                                                            <div className="text-xs text-gray-500">{visit.date ? format(visit.date, 'hh:mm a') : '-'}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-800 whitespace-pre-wrap">{formatRemark(visit.remark || '')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-4 before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
                                         <div className="flex items-center gap-2 mb-6 -ml-6">
                                            <div className="bg-primary/10 p-2 rounded-full border-4 border-white shadow-sm z-10">
                                                <Calendar size={20} className="text-primary" />
                                            </div>
                                            <span className="font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm text-sm border">Timeline</span>
                                            <span className="text-xs text-gray-500">{visitsData.length} Entries</span>
                                         </div>

                                        {visitsData.map((visit: any) => (
                                            <div key={visit._id} className="relative pl-8">
                                                {/* Timeline Node */}
                                                <div className={`absolute -left-0 top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${getIconColor(visit)}`}>
                                                    {renderTimelineIcon(visit)}
                                                </div>

                                                <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-0 overflow-hidden">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-center bg-gray-50/50 px-4 py-2 border-b">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                {visit.actionType === 'instituteAction' && 'Institute'}
                                                                {visit.actionType === 'userAction' && 'User'}
                                                                {visit.actionType === 'communication' && 'Communication'}
                                                                {visit.actionType === 'notes' && 'Notes'}
                                                                {!visit.actionType && visit.source === 'visit' && 'Visit'}
                                                                {!visit.actionType && visit.source === 'myOperator' && 'Call'}
                                                                {!visit.actionType && !visit.source && 'Visit'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs font-bold text-gray-700">{visit.date ? format(visit.date, 'dd/MM/yyyy') : '-'}</span>
                                                            <span className="text-[10px] text-gray-500">{visit.date ? format(visit.date, 'hh:mm a') : '-'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className="p-4">
                                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Remark</div>
                                                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                            {formatRemark(visit.remark || '')}
                                                        </div>
                                                        
                                                        {visit.callDetails?.callRecordingLink && (
                                                            <div className="mt-3 pt-3 border-t">
                                                                 <a 
                                                                    href={visit.callDetails.callRecordingLink} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-medium"
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
                                <div className="text-center py-12 text-gray-400 font-medium text-sm flex flex-col items-center gap-2">
                                    <div className="bg-gray-50 p-4 rounded-full">
                                        <Calendar size={24} className="text-gray-300" />
                                    </div>
                                    No Records Found !
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitsModal;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@od-erp/store';
import { calendarService } from '@od-erp/api-client';
import { Calendar, Loader2 } from 'lucide-react';

export const CalendarSection: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const { entityId, academicSession } = useAppSelector((state) => state.session);

    // Date Logic: Current Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();

    const { data: schedule, isLoading, error } = useQuery({
        queryKey: ['employeeSchedule', entityId, academicSession, user?.employeeId, startOfMonth],
        queryFn: () => {
            if (!entityId || !academicSession || !user?.employeeId) return null;
            return calendarService.getEmployeeSchedule({
                entityId: entityId,
                session: academicSession,
                employeeId: user.employeeId,
                startDate: startOfMonth,
                endDate: endOfMonth,
                version: 'new' // Defaulting to 'new' for React app, logic could be refined
            });
        },
        enabled: !!entityId && !!academicSession && !!user?.employeeId,
    });

    if (!user?.employeeId) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-gray-400">
                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm">Calendar parsing requires Employee ID</span>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    // Adapt data structure if needed. Legacy response has `dates` array with `lectureData`
    // Assuming simplistic rendering for parity verification
    const events = schedule?.dates || [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">My Schedule</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {events.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">No events scheduled.</div>
                ) : (
                    events.map((day: any, idx: number) => {
                        // Handle both old/new structures if possible, or just new
                        const lecture = day.lectureData;
                        if (!lecture) return null;

                        return (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-xs font-bold text-gray-500 mb-1">{new Date(day.date).toDateString()}</div>
                                <div className="font-medium text-gray-800">{lecture.name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>{lecture.startTime} - {lecture.endTime}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${lecture.status === 'scheduled' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                        }`}>{lecture.status}</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
            {error && (
                <div className="text-red-500 text-xs mt-2">Failed to load schedule.</div>
            )}
        </div>
    );
};

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAppSelector } from '@od-erp/store';
import { useCalendarEvents } from '@od-erp/query';
import { startOfWeek, endOfWeek } from 'date-fns';

export const CalendarSection: React.FC = () => {
    const { permissions, entityDetails, user } = useAppSelector((state) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    // Try to get employee ID from user state first, then fallback to localStorage
    const employeeId = user?.employeeId || user?.employee_id || localStorage.getItem('employee') || '';

    console.log('[CalendarSection] Init', { entityId, session, employeeId, hasUser: !!user });

    const hasPermission = permissions?.includes('calendarDashboard');

    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(new Date(), { weekStartsOn: 1 })
    });

    const { data: events, isLoading, error } = useCalendarEvents(
        entityId,
        session,
        employeeId,
        hasPermission,
        dateRange
    );

    const handleDatesSet = (dateInfo: any) => {
        setDateRange({
            start: dateInfo.start,
            end: dateInfo.end
        });
    };

    if (!hasPermission) {
        return <div className="p-4 text-red-500">No Permission: calendarDashboard</div>;
    }

    // if (!employeeId) {
    //    return <div className="p-4 text-yellow-500">Employee ID not found. Please log in as an employee.</div>;
    // }

    if (isLoading) {
        return <div className="p-4 text-center">Loading calendar...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error loading calendar: {(error as any).message}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
            </div>

            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridWeek,dayGridMonth'
                    }}
                    slotMinTime="09:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                    events={events || []}
                    datesSet={handleDatesSet}
                    height="auto"
                    eventDidMount={(info) => {
                        // Basic tooltip implementation using title attribute
                        info.el.title = info.event.title;
                    }}
                />
            </div>
        </div>
    );
};

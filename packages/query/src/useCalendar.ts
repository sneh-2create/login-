import { useQuery } from '@tanstack/react-query';
import { otherService } from '@od-erp/api-client';
import { CalendarEvent } from '@od-erp/types';

export const useCalendarEvents = (
    entityId: string,
    session: string,
    employeeId: string,
    hasPermission: boolean,
    dateRange: { start: Date; end: Date }
) => {
    return useQuery({
        queryKey: ['calendar', entityId, session, employeeId, dateRange.start, dateRange.end],
        queryFn: async () => {
            const response = await otherService.getEmployeeCalendar(
                entityId,
                session,
                employeeId,
                dateRange.start.getTime(),
                dateRange.end.getTime()
            );

            // Transform data to FullCalendar events
            const events: CalendarEvent[] = [];
            response.dates.forEach((dateItem) => {
                const date = new Date(dateItem.date);

                dateItem.lectureData.forEach((lect) => {
                    // Create start and end ISO strings
                    // Assuming startTime and endTime are "HH:MM"
                    const [startHour, startMinute] = lect.startTime.split(':').map(Number);
                    const [endHour, endMinute] = lect.endTime.split(':').map(Number);

                    const start = new Date(date);
                    start.setHours(startHour, startMinute, 0, 0);

                    const end = new Date(date);
                    end.setHours(endHour, endMinute, 0, 0);

                    const title = `${lect.name}${lect.subjectName ? ` (${lect.subjectName} - ${lect.subjectCode})` : ''}`;
                    const lectTitle = `${lect.course}-${lect.stream}-${lect.batch}-${lect.section}`;

                    let className = '';
                    let backgroundColor = '';

                    switch (lect.status) {
                        case 'scheduled':
                            className = 'scheduled';
                            backgroundColor = '#4FC1E8';
                            break;
                        case 'adjusted':
                            className = 'adjusted';
                            break;
                        case 'attendanceMarked':
                            className = 'attendanceMarked';
                            break;
                        case 'cancelled':
                            className = 'cancelled';
                            break;
                        case 'substituted':
                            className = 'substituted';
                            break;
                    }

                    events.push({
                        lect: lectTitle,
                        title: title,
                        start: start.toISOString(),
                        end: end.toISOString(),
                        className,
                        backgroundColor,
                        extendedProps: {
                            lect: lectTitle
                        }
                    });
                });
            });

            return events;
        },
        enabled: !!entityId && !!session && !!employeeId && hasPermission && !!dateRange.start && !!dateRange.end,
        staleTime: 5 * 60 * 1000,
    });
};

import apiClient from '../client';

export interface CalendarEvent {
    lect: string;
    title: string;
    start: string;
    end: string;
    backgroundColor?: string;
    className?: string;
    // Add other fields as per legacy response
}

export const calendarService = {
    getEmployeeSchedule: async (params: {
        entityId: string;
        session: string;
        employeeId: string;
        startDate: number;
        endDate: number;
        version?: 'old' | 'new';
    }) => {
        const { entityId, session, employeeId, startDate, endDate, version } = params;

        // Legacy logic: Angular checked entityPreferences.studentAttendanceVersion
        const endpoint = version === 'old'
            ? '/employeeSchedule/timeTable'
            : '/employeeSchedule/employeeCalendar';

        const response = await apiClient.get(endpoint, {
            params: {
                entity: entityId,
                session,
                employee: employeeId,
                startDate,
                endDate
            }
        });
        return response.data;
    }
};

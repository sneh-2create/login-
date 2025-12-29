import apiClient from '../client';
export const calendarService = {
    getEmployeeSchedule: async (params) => {
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

import apiClient from '../../client';

export const vacantSeatsReportService = {
    getCourseList: async (entityId: string, session: string, isLeet: boolean = false) => {
        let queryParams = `entity=${entityId}&session=${session}`;
        if (isLeet) {
            queryParams += `&isLEET=${isLeet}`;
        }
        const response = await apiClient.get(`/list/course?${queryParams}`);
        return response.data;
    },

    getVacantSeatsReport: async (entityId: string, session: string, course?: string, stream?: string, batch?: string) => {
        let queryParams = `entity=${entityId}&session=${session}`;
        if (course) queryParams += `&course=${encodeURIComponent(course)}`;
        if (stream) queryParams += `&stream=${stream}`;
        if (batch) queryParams += `&batch=${batch}`;

        const response = await apiClient.get(`/subjectCombinationReport/admissionReports?${queryParams}`);
        return response.data;
    },
};

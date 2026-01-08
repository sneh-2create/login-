import apiClient from '../client';

export interface AdmissionSummaryReportParams {
    entity: string;
    session?: string[]; // Angular uses selectedSession which is an array
    startDate: number;
    endDate: number;
    excludeUnpaid?: boolean;
}

export const admissionService = {
    getCourseList: async (entityId: string, session: string, isLeet: boolean = false) => {
        let queryParams = `entity=${entityId}&session=${session}`;
        if (isLeet) {
            queryParams += `&isLEET=${isLeet}`;
        }
        // Angular: URLAddress('/list/course?entity=' +queryParams)
        // Reverting to /list/course as /admission/list/course 404'd
        const response = await apiClient.get(`/list/course?${queryParams}`);
        return response.data;
    },

    viewAdmissionSummaryReport: async (formData: AdmissionSummaryReportParams) => {
        // Angular: URLAddress('/admissionSummary/admissionReports')
        const response = await apiClient.post(`/admissionSummary/admissionReports`, formData);
        return response.data;
    },

    getSessionList: async (entityId: string) => {
        // Angular: URLAddress('/list/session?entity=' +entityId)
        const response = await apiClient.get(`/list/session?entity=${entityId}`);
        return response.data;
    },

    getVacantSeatsReport: async (entityId: string, session: string, course?: string, stream?: string, batch?: string) => {
        // Angular: URLAddress('/subjectCombinationReport/admissionReports?entity='...)
        let queryParams = `entity=${entityId}&session=${session}`;
        if (course) queryParams += `&course=${encodeURIComponent(course)}`;
        if (stream) queryParams += `&stream=${stream}`;
        if (batch) queryParams += `&batch=${batch}`;

        const response = await apiClient.get(`/subjectCombinationReport/admissionReports?${queryParams}`);
        return response.data;
    },

    viewAdmissionMaster: async (entityId: string, session: string) => {
        const response = await apiClient.get(`/view/admissionMaster?entity=${entityId}&session=${session}`);
        return response.data;
    },

    listEmployee: async (entityId: string, role?: string) => {
        let queryParams = `entity=${entityId}`;
        if (role) {
            queryParams += `&role=${role}`;
        }
        const response = await apiClient.get(`/list/Employee?${queryParams}`);
        return response.data;
    },

    counselorTagList: async (entityId: string, session: string, counselorId?: string, startDate?: number, endDate?: number) => {
        let queryParams = `entity=${entityId}&session=${session}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        if (counselorId) queryParams += `&counselorId=${counselorId}`;

        const response = await apiClient.get(`/counselorTagReport/admissionReports?${queryParams}`);
        return response.data;
    }
};

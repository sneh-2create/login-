import apiClient from '../client';

export interface admissionSummaryReportParams {
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
        const response = await apiClient.get(`/list/course?${queryParams}`);
        return response.data;
    },

    viewAdmissionSummaryReport: async (formData: admissionSummaryReportParams) => {
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
    },

    getAdmissionDashboard: async (entityId: string, session: string, admissionSession: string) => {
        // Angular: URLAddress('/getAdmissionDashboard/dashboard?entity=...&session=...&admissionSession=...')
        const response = await apiClient.get(`/getAdmissionDashboard/dashboard?entity=${entityId}&session=${session}&admissionSession=${admissionSession}`);
        return response.data;
    },

    getAdmissionStageCount: async (entityId: string, admissionSession: string) => {
        // Angular: URLAddress('/getCountByStages/admissionStudentData?entity=...&admissionSession=...')
        const response = await apiClient.get(`/getCountByStages/admissionStudentData?entity=${entityId}&admissionSession=${admissionSession}`);
        return response.data;
    },

    getStreamList: async (entityId: string, course: string) => {
        const response = await apiClient.get(`/list/stream?entity=${entityId}&course=${course}`);
        return response.data;
    },

    getBatchList: async (entityId: string, course: string, stream: string) => {
        const response = await apiClient.get(`/list/batch?entity=${entityId}&course=${course}&stream=${stream}`);
        return response.data;
    },

    getSourceList: async (entityId: string) => {
        const response = await apiClient.get(`/list/source?entity=${entityId}`);
        return response.data;
    },

    addReportFile: async (formData: {
        reportType: string;
        tableHeads: any[];
        filterValues: any[];
        sortBy: string;
        entity: string;
        qac?: string;
    }) => {
        const response = await apiClient.post(`/add/reportFile`, formData);
        return response.data;
    },
};

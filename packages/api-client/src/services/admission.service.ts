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
        // Angular: this.URLAddress('/list/course?entity=' +queryParams) -> /admission/list/course...
        const response = await apiClient.get(`/list/course?${queryParams}`);
        return response.data;
    },

    viewAdmissionSummaryReport: async (formData: AdmissionSummaryReportParams) => {
        // Angular: this.URLAddress('/admissionSummary/admissionReports') -> /admission/admissionSummary/admissionReports
        const response = await apiClient.post(`/admissionSummary/admissionReports`, formData);
        return response.data;
    },

    getSessionList: async (entityId: string) => {
        // Angular: this.http.get<UserData[]>(this.URLAddress('/list/session?entity=' +entityId))
        // -> /admission/list/session?entity=...
        const response = await apiClient.get(`/list/session?entity=${entityId}`);
        return response.data;
    }
};

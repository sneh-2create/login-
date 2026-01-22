import apiClient from '../../client';
import { AdmissionSummaryReportParams } from '@od-erp/types';

export const admissionSummaryReportService = {
    getSessionList: async (entityId: string) => {
        const response = await apiClient.get(`/list/session?entity=${entityId}`);
        return response.data;
    },

    viewAdmissionSummaryReport: async (formData: AdmissionSummaryReportParams) => {
        const response = await apiClient.post(`/admissionSummary/admissionReports`, formData);
        return response.data;
    }
};

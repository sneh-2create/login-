import apiClient from '../../client';
import { AdmissionDailyCollectionReportParams, AdmissionTransaction } from '@od-erp/types';

export const dailyCollectionReportService = {
    listDailyCollectionReport: async (payload: AdmissionDailyCollectionReportParams): Promise<AdmissionTransaction[]> => {
        const response = await apiClient.post<AdmissionTransaction[]>(`/dailyCollectionReport/admissionReports`, payload);
        return response.data;
    }
};

import apiClient from '../../client';
import { admissionDailyCollectionReportParams, admissionTransaction } from '@od-erp/types';

export const dailyCollectionReportService = {
    listDailyCollectionReport: async (payload: admissionDailyCollectionReportParams): Promise<admissionTransaction[]> => {
        const response = await apiClient.post<admissionTransaction[]>(`/dailyCollectionReport/admissionReports`, payload);
        return response.data;
    }
};

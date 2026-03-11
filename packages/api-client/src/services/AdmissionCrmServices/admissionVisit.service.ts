import apiClient from '../../client';
import { AdmissionVisit, AdmissionVisitPayload } from '@od-erp/types';

export const admissionVisitService = {
    listAdmissionVisit: async (payload: AdmissionVisitPayload) => {
        const response = await apiClient.post<{ data: AdmissionVisit[]; totalCount: number }>('/list/admissionVisit', payload);
        return response.data;
    },

    addAdmissionVisit: async (payload: any) => {
        const response = await apiClient.post<any>('/add/admissionVisit', payload);
        return response.data;
    },
};

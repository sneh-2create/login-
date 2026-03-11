import apiClient from '../../client';
import { AdmissionLead, AdmissionLeadPayload } from '@od-erp/types';

export const admissionLeadService = {
    listAdmissionLeads: async (payload: AdmissionLeadPayload) => {
        const response = await apiClient.post<{ data: AdmissionLead[]; totalCount: number }>('/list/admissionStudentData', payload);
        return response.data;
    },

    addAdmissionLead: async (formData: any) => {
        const response = await apiClient.post<any>('/add/admissionStudentData', formData);
        return response.data;
    },

    updateAdmissionLead: async (formData: any) => {
        const response = await apiClient.post<any>('/edit/admissionStudentData', formData);
        return response.data;
    },

    updateAdmissionLeadTag: async (payload: { id: string; tag: string }) => {
        const response = await apiClient.post<any>('/update/tag', payload);
        return response.data;
    },

    bulkCounselorUpdate: async (payload: { studentDataIds: string[], entity: string, counselor: string }) => {
        const response = await apiClient.post<any>('/bulkUpdateCounselor/bulkRequest', payload);
        return response.data;
    }
};

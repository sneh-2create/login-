import apiClient from '../../client';
import { admissionLead, admissionLeadPayload } from '@od-erp/types';

export const admissionLeadService = {
    listAdmissionLeads: async (payload: admissionLeadPayload) => {
        const response = await apiClient.post<{ data: admissionLead[]; totalCount: number }>('/list/admissionStudentData', payload);
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

    // Potentially needed for specific updates like tags if not covered by generic update
    updateAdmissionLeadTag: async (payload: { id: string; tag: string }) => {
        const response = await apiClient.post<any>('/update/tag', payload);
        return response.data;
    }
};

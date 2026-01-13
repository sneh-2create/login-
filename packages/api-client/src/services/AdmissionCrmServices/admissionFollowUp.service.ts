import apiClient from '../../client';
import { AdmissionFollowUp, AdmissionFollowUpPayload, AdmissionFollowUpStats } from '@od-erp/types';

export const admissionFollowUpService = {
    listFollowUp: async (payload: AdmissionFollowUpPayload) => {
        const response = await apiClient.post<AdmissionFollowUp[]>('/list/admissionFollowUp', payload);
        return response.data;
    },

    getFilterCountFollowUp: async (payload: AdmissionFollowUpPayload) => {
        const response = await apiClient.post<AdmissionFollowUpStats>('/filterCount/admissionFollowUp', payload);
        return response.data;
    },

    addAdmissionFollowUp: async (formData: any) => {
        const response = await apiClient.post<any>('/add/admissionFollowUp', formData);
        return response.data;
    },

    editAdmissionFollowUp: async (formData: any) => {
        const response = await apiClient.post<any>('/edit/admissionFollowUp', formData);
        return response.data;
    },

    deleteAdmissionFollowUp: async (id: string) => {
        const response = await apiClient.get<any>(`/delete/admissionFollowUp?id=${id}`);
        return response.data;
    }
};

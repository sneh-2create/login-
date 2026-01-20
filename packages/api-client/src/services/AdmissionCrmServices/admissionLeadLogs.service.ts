import apiClient from '../../client';
import { AdmissionLeadLogPayload, AdmissionLeadLogResponse } from '@od-erp/types';

export const admissionLeadLogsService = {
    listAdmissionLeadLogs: async (payload: AdmissionLeadLogPayload) => {
        const response = await apiClient.post<AdmissionLeadLogResponse>('/list/admissionLeadLogs', payload);
        return response.data;
    },

    viewAdmissionLeadLogs: async (id: string) => {
        const response = await apiClient.get<any>(`/view/admissionLeadLogs?id=${id}`);
        return response.data;
    },

    deleteAdmissionLeadLogs: async (id: string) => {
        const response = await apiClient.get<any>(`/delete/admissionLeadLogs?id=${id}`);
        return response.data;
    },

    editAdmissionLeadLogs: async (formData: any) => {
        const response = await apiClient.post<any>('/edit/admissionLeadLogs', formData);
        return response.data;
    },

    clickToCall: async (formData: any) => {
        const response = await apiClient.post<any>('/peerToPeerCall/admissionLeadLogs', formData);
        return response.data;
    }
};

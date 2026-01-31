import apiClient from '../../client';
import { AdmissionNote, AdmissionNotePayload } from '@od-erp/types';

export const admissionNoteService = {
    listAdmissionNote: async (payload: AdmissionNotePayload) => {
        const response = await apiClient.post<{ data: AdmissionNote[]; totalCount: number }>('/list/admissionNote', payload);
        return response.data;
    },

    addAdmissionNote: async (payload: any) => {
        const response = await apiClient.post<any>('/add/admissionNote', payload);
        return response.data;
    },
};

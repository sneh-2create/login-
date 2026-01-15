import apiClient from '../../client';
import { AdmissionLead, AdmissionStudentDataPayload, AdmissionStageSetup, AdmissionStageCount } from '@od-erp/types';

export const admissionStudentDataService = {
    listAdmissionStudentData: async (payload: AdmissionStudentDataPayload) => {
        const response = await apiClient.post<{ data: AdmissionLead[]; totalCount: number }>('/list/admissionStudentData', payload);
        return response.data;
    },

    listAdmissionStageSetup: async (entityId: string, session: string) => {
        const response = await apiClient.get<AdmissionStageSetup[]>(`/list/admissionStageSetup?entity=${entityId}&session=${session}`);
        return response.data;
    },

    listStages: async (entityId: string, session: string) => {
        const response = await apiClient.get<AdmissionStageCount[]>(`/getCountByStages/admissionStudentData?entity=${entityId}&session=${session}`);
        return response.data;
    },

    viewAdmissionMaster: async (entityId: string, session: string) => {
        const response = await apiClient.get<any>(`/view/admissionMaster?entity=${entityId}&session=${session}`);
        return response.data;
    },

    addAdmissionStudentData: async (payload: any) => {
        const response = await apiClient.post<any>('/add/admissionStudentData', payload);
        return response.data;
    }
};

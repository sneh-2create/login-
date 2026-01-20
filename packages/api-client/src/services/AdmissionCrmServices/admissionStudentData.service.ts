import apiClient from '../../client';
import { admissionLead, admissionStudentDataPayload, admissionStageSetup, admissionStageCount } from '@od-erp/types';

export const admissionStudentDataService = {
    listAdmissionStudentData: async (payload: admissionStudentDataPayload) => {
        const response = await apiClient.post<{ data: admissionLead[]; totalCount: number }>('/list/admissionStudentData', payload);
        return response.data;
    },

    listAdmissionStageSetup: async (entityId: string, session: string) => {
        const response = await apiClient.get<admissionStageSetup[]>(`/list/admissionStageSetup?entity=${entityId}&session=${session}`);
        return response.data;
    },

    listStages: async (entityId: string, session: string) => {
        const response = await apiClient.get<admissionStageCount[]>(`/getCountByStages/admissionStudentData?entity=${entityId}&session=${session}`);
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

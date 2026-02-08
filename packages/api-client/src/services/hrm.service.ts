import apiClient from '../client';
import { HrmMasterResponse } from '@od-erp/types';

export const hrmService = {
    viewHrmMaster: async (entityId: string) => {
        const { data } = await apiClient.get<HrmMasterResponse>(`/view/hrmMaster?entity=${entityId}`);
        return data;
    },
    getActiveEmployee: async (userId: string) => {
        const { data } = await apiClient.get<any>(`/active/employee?id=${userId}`);
        return data;
    }
};

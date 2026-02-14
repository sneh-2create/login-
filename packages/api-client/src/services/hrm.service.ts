import apiClient from '../client';
import { HrmMasterResponse, EmployeeDashboardResponse } from '@od-erp/types';

export const hrmService = {
    viewHrmMaster: async (entityId: string) => {
        const { data } = await apiClient.get<HrmMasterResponse>(`/view/hrmMaster?entity=${entityId}`);
        return data;
    },
    getActiveEmployee: async (userId: string) => {
        const { data } = await apiClient.get<any>(`/active/employee?id=${userId}`);
        return data;
    },
    getEmployeeDashboard: async (
        entityId: string,
        session: string,
        leaveCycleName: string,
        leaveCycleStartDate: string,
        leaveCycleEndDate: string,
        employeeType?: string
    ) => {
        let queryParams = `entity=${entityId}&session=${session}&leaveCycleName=${leaveCycleName}&leaveCycleStartDate=${leaveCycleStartDate}&leaveCycleEndDate=${leaveCycleEndDate}`;
        if (employeeType) {
            queryParams += `&employeeType=${employeeType}`;
        }
        const { data } = await apiClient.get<EmployeeDashboardResponse>(`/getEmployeeDashboard/dashboard?${queryParams}`);
        return data;
    }
};

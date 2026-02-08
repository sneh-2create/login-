import apiClient from '../client';
import { HodDashboardResponse } from '@od-erp/types';

export const otherService = {
    getHodDashboard: async (
        entity: string,
        session: string,
        leaveCycleName: string,
        leaveCycleStartDate: string,
        leaveCycleEndDate: string,
        hodEmployee: string,
        employeeType?: string
    ) => {
        let queryParams = `entity=${entity}&session=${session}&leaveCycleName=${leaveCycleName}&leaveCycleStartDate=${leaveCycleStartDate}&leaveCycleEndDate=${leaveCycleEndDate}&hodEmployee=${hodEmployee}`;

        if (employeeType) {
            queryParams += `&employeeType=${employeeType}`;
        }

        const { data } = await apiClient.get<HodDashboardResponse>(`/getHODDashboard/dashboard?${queryParams}`);
        return data;
    },
};

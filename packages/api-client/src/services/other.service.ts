import apiClient from '../client';
import { HodDashboardResponse, CommunicationDashboardResponse, AnalyticsDashboardFilters, AnalyticsDashboardResponse } from '@od-erp/types';

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
    getCommunicationData: async (entity: string, session: string) => {
        const { data } = await apiClient.get<CommunicationDashboardResponse>('/getCommunicationDashboard/dashboard', {
            params: { entity, session }
        });
        return data;
    },
    getAnalyticsData: async (entity: string, session: string, filters: AnalyticsDashboardFilters) => {
        const { data } = await apiClient.post<AnalyticsDashboardResponse>(
            `/getAnalyticsData/dashboard?entity=${entity}&session=${session}`,
            filters
        );
        return data;
    },
};

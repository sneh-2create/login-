import apiClient from '../client';
import { HodDashboardResponse, CommunicationDashboardResponse, AnalyticsDashboardFilters, AnalyticsDashboardResponse, MessDashboardResponse, CalendarResponse, EmployeeProfile, ProfileBirthdayEmployee, Announcement } from '@od-erp/types';

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
    getMessDashboardData: async (entity: string, session: string) => {
        const { data } = await apiClient.get<MessDashboardResponse>(`/getMessMangementDashboard/dashboard`, {
            params: { entity, session }
        });
        return data;
    },
    getEmployeeCalendar: async (entityId: string, session: string, employeeId: string, startDate: number, endDate: number) => {
        const { data } = await apiClient.get<CalendarResponse>(`/employeeSchedule/employeeCalendar`, {
            params: {
                entity: entityId,
                session,
                employee: employeeId,
                startDate,
                endDate
            }
        });
        return data;
    },
    viewEmployee: async (id: string) => {
        const { data } = await apiClient.get<EmployeeProfile>(`/view/employee`, {
            params: { id }
        });
        return data;
    },
    getEmployeeBirthday: async (entityId: string) => {
        const { data } = await apiClient.get<ProfileBirthdayEmployee[]>(`/currentMonthBirthday/employee`, {
            params: { entity: entityId }
        });
        return data;
    },
    listLatestAnnouncemets: async (employeeId: string) => {
        const { data } = await apiClient.post<Announcement[]>(`/listRecentAnnouncementsByEmployeeId/employeeAnnouncement`, {
            employeeId
        });
        return data;
    }
};

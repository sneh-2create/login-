import {
    EntityModuleCount,
    EntityLocationCount,
    ExaminationDashboardResponse
} from '@od-erp/types';
import apiClient from '../client';

export const dashboardService = {
    getCount: async () => {
        const response = await apiClient.get('/getCounts/superDashboard');
        return response.data;
    },

    getActiveStudents: async (startDate: number, endDate: number) => {
        const response = await apiClient.get('/getActiveStudents/superDashboard', { params: { startDate, endDate } });
        return response.data;
    },

    getOnlineFeePayments: async (startDate: number, endDate: number) => {
        const response = await apiClient.get('/getOnlineFeePayments/superDashboard', { params: { startDate, endDate } });
        return response.data;
    },

    getCommunicationReport: async (startDate: number, endDate: number) => {
        const response = await apiClient.get('/getCommunicationReport/superDashboard', { params: { startDate, endDate } });
        return response.data;
    },

    getUserByEntity: async (startDate: number, endDate: number) => {
        const response = await apiClient.get('/getUsersByEntity/superDashboard', { params: { startDate, endDate } });
        return response.data;
    },

    getEntityCountByModule: async (): Promise<EntityModuleCount[]> => {
        const response = await apiClient.get<EntityModuleCount[]>('/getEntityCountByModule/superDashboard');
        return response.data;
    },

    getEntityCountByLocation: async (location: string): Promise<EntityLocationCount[]> => {
        const response = await apiClient.get<EntityLocationCount[]>('/getEntityCountByLocation/superDashboard', {
            params: { location }
        });
        return response.data;
    },

    getExaminationDashboard: async (entity: string, session: string) => {
        const response = await apiClient.get<ExaminationDashboardResponse>('/getExaminationDashboard/dashboard', {
            params: { entity, session }
        });
        return response.data;
    }

};

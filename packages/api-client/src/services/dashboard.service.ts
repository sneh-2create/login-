import {
    entityModuleCount,
    entityLocationCount
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

    getEntityCountByModule: async (): Promise<entityModuleCount[]> => {
        const response = await apiClient.get<entityModuleCount[]>('/getEntityCountByModule/superDashboard');
        return response.data;
    },

    getEntityCountByLocation: async (location: string): Promise<entityLocationCount[]> => {
        const response = await apiClient.get<entityLocationCount[]>('/getEntityCountByLocation/superDashboard', {
            params: { location }
        });
        return response.data;
    }
};

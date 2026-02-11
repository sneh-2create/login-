import {
    EntityModuleCount,
    EntityLocationCount,
    ExaminationDashboardResponse
} from '@od-erp/types';
import apiClient from '../client';

export interface AttendanceInstituteSummary {
    course: string;
    stream: string;
    batch?: string;
    section: string;
    totalPresent: number;
    totalAbsent: number;
    totalLeave: number;
    totalNotMarked: number;
    dateTime?: string;
    sequenceNo?: number;
}

import { AppliedLeave, LibraryDashboardResponse } from '@od-erp/types';
export type { AppliedLeave, LibraryDashboardResponse };

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
    },

    getInstituteSummary: async (entity: string, session: string, startDate: number, endDate: number) => {
        const response = await apiClient.post<AttendanceInstituteSummary[]>('/instituteSummary/studentAttendance', {
            entity, session, startDate, endDate
        });
        return response.data;
    },

    getItems: async (entity: string, session: string) => {
        const response = await apiClient.get('/examination/dashboard/items', { params: { entity, session } });
        return response.data;
    },

    getInstituteSummaryNew: async (entity: string, session: string, startDate: number, endDate: number) => {
        const response = await apiClient.post<AttendanceInstituteSummary[]>('/instituteSummary/studentAttendanceNew', {
            entity, session, startDate, endDate
        });
        return response.data;
    },

    getAppliedLeaves: async (entity: string, session: string, pageNumber: number = 1, pageSize: number = 10) => {
        const response = await apiClient.get<AppliedLeave[]>('/list/appliedLeave', {
            params: { entity, session, pageNumber, pageSize }
        });
        return response.data;
    },

    getLibraryDashboard: async (entity: string, session: string) => {
        const response = await apiClient.get<LibraryDashboardResponse>('/getLibraryDashboard/dashboard', {
            params: { entity, session }
        });
        return response.data;
    }

};




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

    getCountByStages: async (entityId: string, session: string) => {
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
    },

    editAdmissionStudentData: async (payload: any) => {
        const response = await apiClient.post<any>('/edit/admissionStudentData', payload);
        return response.data;
    },

    getStudentTimeline: async (studentId: string) => {
        const response = await apiClient.get<any[]>(`/view/studentTimeline?studentId=${studentId}`);
        return response.data;
    },
    // Document Upload
    getPresignedUrl: async (qac: string, payload: any) => {
        const response = await apiClient.post<any>(`/getPresignedUrl?qac=${qac}`, payload);
        return response.data;
    },

    uploadAdmissionDocuments: async (id: string, qac: string, payload: any) => {
        const response = await apiClient.post<any>(`/uploadAdmissionDocuments?id=${id}&qac=${qac}`, payload);
        return response.data;
    },

    // Helper to upload file to S3 via presigned URL
    uploadFileToUrl: async (url: string, file: File, contentType: string) => {
        // Use fetch directly as this is an external URL, not the API client
        const response = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': contentType
            }
        });
        if (!response.ok) {
            throw new Error('Failed to upload file to storage');
        }
        return response;
    },

    viewAdmissionTransactionList: async (entityId: string, session: string, studentId: string) => {
        const response = await apiClient.get<any[]>(`/list/admissionTransaction?entity=${entityId}&session=${session}&studentData=${studentId}`);
        return response.data;
    },

    listAdmissionRefundTransactions: async (entityId: string, session: string, studentId: string) => {
        const response = await apiClient.get<any[]>(`/list/refundTransaction?entity=${entityId}&session=${session}&studentData=${studentId}`);
        return response.data;
    }
};


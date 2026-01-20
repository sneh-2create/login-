import apiClient from '../../client';
import { AdmissionTransaction, AdmissionTransactionPayload } from '@od-erp/types';

export const admissionTransactionService = {
    listAdmissionTransaction: async (payload: AdmissionTransactionPayload) => {
        const { entity, session, startDate, endDate, status, selectedStatus, search } = payload;

        let params = new URLSearchParams();
        if (entity) params.append('entity', entity);
        if (session) params.append('session', session);
        if (startDate) params.append('startDate', String(startDate));
        if (endDate) params.append('endDate', String(endDate));
        if (status) params.append('status', status);
        if (selectedStatus) params.append('selectedStatus', selectedStatus);
        if (search) params.append('search', search);

        // return this.http.get(this.url + '/list/admissionTransaction' + '?entity=' + entity + '&session=' + session + '&startDate=' + startDate + '&endDate=' + endDate + '&status=' + status + '&selectedStatus=' + selectedStatus + '&search=' + search);
        // New Api Client structure
        // const response = await apiClient.post<{ data: admissionTransaction[]; totalCount: number }>('/list/admissionTransaction', payload);

        // Based on original Angular service, it seems it was a GET request with query params? 
        // "return this.http.get(this.url + '/list/admissionTransaction'..."
        // But some services use POST. Verify if this is correct. Keeping GET as per comment trace.

        const response = await apiClient.get<AdmissionTransaction[]>(`/list/admissionTransaction?${params.toString()}`);
        return response.data;
    },

    getAdmissionTransactionById: async (id: string) => {
        const response = await apiClient.get<AdmissionTransaction>(`/view/admissionTransaction/${id}`);
        return response.data;
    },

    editAdmissionTransaction: async (payload: any) => {
        const response = await apiClient.post<any>('/edit/admissionTransaction', payload);
        return response.data;
    },

    deleteAdmissionTransaction: async (id: string) => {
        const response = await apiClient.delete<any>(`/delete/admissionTransaction/${id}`);
        return response.data;
    },

    retryAdmissionVoucher: async (id: string) => {
        const response = await apiClient.get<any>(`/retry/admissionVoucher/${id}`);
        return response.data;
    },

    pushTxnToODPay: async (payload: any) => {
        const response = await apiClient.post<any>('/push/txnToODPay', payload);
        return response.data;
    }
};

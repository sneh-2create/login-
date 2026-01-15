import apiClient from '../../client';
import { AdmissionTransaction, AdmissionTransactionPayload } from '@od-erp/types';

export const admissionTransactionService = {
    listAdmissionTransaction: async (payload: AdmissionTransactionPayload) => {
        // Angular: this.service.listAdmissionTransaction(this.entityId, this.selectedSession, startDate, endDate, this.status,this.selectedStatus,this.search)
        // It seems the Angular service accepted individual args, but our new pattern prefers a payload object.
        // However, I need to check the actual API signature. 
        // Based on other services, we usually send a POST with payload or GET with query params.
        // Angular implementation suggests: 
        // return this.http.get(this.url + '/list/admissionTransaction' + '?entity=' + entity + '&session=' + session + '&startDate=' + startDate + '&endDate=' + endDate + '&status=' + status + '&selectedStatus=' + selectedStatus + '&search=' + search);

        const params = new URLSearchParams({
            entity: payload.entity,
            session: payload.session,
            startDate: payload.startDate?.toString() || '',
            endDate: payload.endDate?.toString() || '',
            status: payload.status || '',
            selectedStatus: payload.selectedStatus || '',
            search: payload.search || ''
        });

        // Remove empty keys
        Array.from(params.keys()).forEach(key => {
            if (!params.get(key)) params.delete(key);
        });

        const response = await apiClient.get<AdmissionTransaction[]>(`/list/admissionTransaction?${params.toString()}`);
        return response.data;
    },

    viewAdmissionTransaction: async (id: string) => {
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

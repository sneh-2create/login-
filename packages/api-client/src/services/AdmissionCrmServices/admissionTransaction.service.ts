import apiClient from '../../client';
import { AdmissionTransaction, AdmissionTransactionPayload } from '@od-erp/types';

export const admissionTransactionService = {
    listAdmissionTransaction: async (payload: AdmissionTransactionPayload) => {
        const { entity, session, startDate, endDate, status, voucherStatus, search } = payload;

        const params = new URLSearchParams();
        if (entity) params.append('entity', entity);
        if (session) params.append('session', session);
        if (startDate) params.append('startDate', String(startDate));
        if (endDate) params.append('endDate', String(endDate));
        if (status) params.append('status', status);
        if (voucherStatus) params.append('voucherStatus', voucherStatus);
        if (search) params.append('search', search);

        const response = await apiClient.get<AdmissionTransaction[]>(`/list/admissionTransaction?${params.toString()}`);
        return response.data;
    },

    getAdmissionTransactionById: async (id: string) => {
        const response = await apiClient.get<AdmissionTransaction>(`/view/admissionTransaction?id=${id}`);
        return response.data;
    },

    editAdmissionTransaction: async (payload: any) => {
        const response = await apiClient.post<any>('/edit/admissionTransaction', payload);
        return response.data;
    },

    cancelAdmissionReceipt: async (payload: any) => {
        const response = await apiClient.post<any>('/cancelReceipt/admissionTransaction', payload);
        return response.data;
    },

    deleteAdmissionTransaction: async (id: string) => {
        const response = await apiClient.get<any>(`/delete/admissionTransaction?id=${id}`);
        return response.data;
    },

    retryAdmissionVoucher: async (id: string) => {
        const response = await apiClient.get<any>(`/reCreate/accountingVoucher?id=${id}&txnType=admission`);
        return response.data;
    },

    pushTxnToODPay: async (payload: any) => {
        const response = await apiClient.post<any>('/pushTransaction/odpay', payload);
        return response.data;
    }
};

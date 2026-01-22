import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { admissionTransactionService } from '@od-erp/api-client';
import { AdmissionTransaction, AdmissionTransactionPayload } from '@od-erp/types';

export const useAdmissionTransactions = (payload: AdmissionTransactionPayload) => {
    return useQuery<AdmissionTransaction[]>({
        queryKey: ['admissionTransactions', payload],
        queryFn: () => admissionTransactionService.listAdmissionTransaction(payload),
        enabled: !!payload.entity && !!payload.session,
        placeholderData: keepPreviousData,
    });
};

export const useAdmissionTransaction = (id: string) => {
    return useQuery<AdmissionTransaction>({
        queryKey: ['admissionTransaction', id],
        queryFn: () => admissionTransactionService.getAdmissionTransactionById(id),
        enabled: !!id,
    });
};

export const useEditAdmissionTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionTransactionService.editAdmissionTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionTransactions'] });
            queryClient.invalidateQueries({ queryKey: ['admissionTransaction'] });
        },
    });
};

export const useDeleteAdmissionTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionTransactionService.deleteAdmissionTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionTransactions'] });
        },
    });
};

export const useRetryAdmissionVoucher = () => {
    return useMutation({
        mutationFn: admissionTransactionService.retryAdmissionVoucher,
    });
};

export const usePushTxnToODPay = () => {
    return useMutation({
        mutationFn: admissionTransactionService.pushTxnToODPay,
    });
};

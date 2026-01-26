import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { admissionStudentDataService } from '@od-erp/api-client';
import { AdmissionStudentDataPayload, AdmissionLead, AdmissionStageSetup, AdmissionStageCount } from '@od-erp/types';

export const useAdmissionStudentData = (payload: AdmissionStudentDataPayload) => {
    return useQuery<{ data: AdmissionLead[]; totalCount: number }>({
        queryKey: ['admissionStudentData', payload],
        queryFn: () => admissionStudentDataService.listAdmissionStudentData(payload),
        enabled: !!payload.entity && !!payload.session,
        placeholderData: keepPreviousData,
    });
};

export const useAdmissionStageSetup = (entityId: string, session: string) => {
    return useQuery<AdmissionStageSetup[]>({
        queryKey: ['admissionStageSetup', entityId, session],
        queryFn: () => admissionStudentDataService.listAdmissionStageSetup(entityId, session),
        enabled: !!entityId && !!session,
        staleTime: 5 * 60 * 1000,
    });
};

export const useAdmissionStages = (entityId: string, session: string) => {
    return useQuery<AdmissionStageCount[]>({
        queryKey: ['admissionStages', entityId, session],
        queryFn: () => admissionStudentDataService.getCountByStages(entityId, session),
        enabled: !!entityId && !!session,
        staleTime: 0,
    });
};

export const useAdmissionMaster = (entityId: string, session: string) => {
    return useQuery<any>({
        queryKey: ['admissionMaster', entityId, session],
        queryFn: () => admissionStudentDataService.viewAdmissionMaster(entityId, session),
        enabled: !!entityId && !!session,
        staleTime: 10 * 60 * 1000,
    });
};

export const useAddAdmissionStudentData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionStudentDataService.addAdmissionStudentData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionStudentData'] });
            queryClient.invalidateQueries({ queryKey: ['admissionStages'] });
        },
    });
};

export const useEditAdmissionStudentData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionStudentDataService.editAdmissionStudentData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionStudentData'] });
        },
    });
};

export const useAdmissionStudentTransactions = (entityId: string, session: string, studentId: string) => {
    return useQuery<any[]>({
        queryKey: ['admissionStudentTransactions', entityId, session, studentId],
        queryFn: () => admissionStudentDataService.viewAdmissionTransactionList(entityId, session, studentId),
        enabled: !!entityId && !!session && !!studentId,
    });
};

export const useAdmissionStudentRefunds = (entityId: string, session: string, studentId: string) => {
    return useQuery<any[]>({
        queryKey: ['admissionStudentRefunds', entityId, session, studentId],
        queryFn: () => admissionStudentDataService.listAdmissionRefundTransactions(entityId, session, studentId),
        enabled: !!entityId && !!session && !!studentId,
    });
};

export const useAdmissionFollowUps = (entityId: string, studentId: string) => {
    return useQuery<any[]>({
        queryKey: ['admissionFollowUps', entityId, studentId],
        queryFn: () => admissionStudentDataService.listAdmissionFollowUp({ entity: entityId, studentData: studentId }),
        enabled: !!entityId && !!studentId,
    });
};

export const useAddAdmissionFollowUp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionStudentDataService.addAdmissionFollowUp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionFollowUps'] });
        },
    });
};

export const useEditAdmissionFollowUp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionStudentDataService.editAdmissionFollowUp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionFollowUps'] });
        },
    });
};

export const useViewAdmissionStudentData = (studentId: string) => {
    return useQuery<AdmissionLead>({
        queryKey: ['viewAdmissionStudentData', studentId],
        queryFn: () => admissionStudentDataService.viewAdmissionStudentData(studentId),
        enabled: !!studentId,
    });
};

export const useCourses = (entityId: string, session: string) => {
    return useQuery<any[]>({
        queryKey: ['courses', entityId, session],
        queryFn: () => admissionStudentDataService.listCourses(entityId, session),
        enabled: !!entityId && !!session,
        staleTime: 10 * 60 * 1000,
    });
};

export const usePartnerInstitutes = (entityId: string) => {
    return useQuery<any[]>({
        queryKey: ['partnerInstitutes', entityId],
        queryFn: () => admissionStudentDataService.listPartnerInstitutes(entityId),
        enabled: !!entityId,
        staleTime: 10 * 60 * 1000,
    });
};

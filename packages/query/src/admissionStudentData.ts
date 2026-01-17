import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { admissionStudentDataService } from '@od-erp/api-client';
import { admissionStudentDataPayload, admissionLead, admissionStageSetup, admissionStageCount } from '@od-erp/types';

export const useAdmissionStudentData = (payload: admissionStudentDataPayload) => {
    return useQuery<{ data: admissionLead[]; totalCount: number }>({
        queryKey: ['admissionStudentData', payload],
        queryFn: () => admissionStudentDataService.listAdmissionStudentData(payload),
        enabled: !!payload.entity && !!payload.session,
        placeholderData: keepPreviousData,
    });
};

export const useAdmissionStageSetup = (entityId: string, session: string) => {
    return useQuery<admissionStageSetup[]>({
        queryKey: ['admissionStageSetup', entityId, session],
        queryFn: () => admissionStudentDataService.listAdmissionStageSetup(entityId, session),
        enabled: !!entityId && !!session,
        staleTime: 5 * 60 * 1000,
    });
};

export const useAdmissionStages = (entityId: string, session: string) => {
    return useQuery<admissionStageCount[]>({
        queryKey: ['admissionStages', entityId, session],
        queryFn: () => admissionStudentDataService.listStages(entityId, session),
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

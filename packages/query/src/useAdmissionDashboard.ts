import { useQuery } from '@tanstack/react-query';
import { admissionService } from '@od-erp/api-client';
import { AdmissionDashboardResponse, AdmissionStageCount } from '@od-erp/types';

export const useAdmissionDashboardData = (
    entityId: string,
    session: string,
    admissionSession: string,
    enabled: boolean = true
) => {
    return useQuery<AdmissionDashboardResponse>({
        queryKey: ['admissionDashboard', entityId, session, admissionSession],
        queryFn: async () => {
            const response = await admissionService.getAdmissionDashboard(entityId, session, admissionSession);
            return response;
        },
        enabled: enabled && !!entityId && !!session && !!admissionSession,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useAdmissionStageCount = (
    entityId: string,
    admissionSession: string,
    enabled: boolean = true
) => {
    return useQuery<AdmissionStageCount[]>({
        queryKey: ['admissionStageCount', entityId, admissionSession],
        queryFn: async () => {
            const response = await admissionService.getAdmissionStageCount(entityId, admissionSession);
            return response;
        },
        enabled: enabled && !!entityId && !!admissionSession,
        staleTime: 5 * 60 * 1000,
    });
};

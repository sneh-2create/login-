import { useQuery } from '@tanstack/react-query';
import { otherService, hrmService } from '@od-erp/api-client';
import { HodDashboardResponse, HrmMasterResponse } from '@od-erp/types';

export const useHodDashboardData = (
    entity: string,
    session: string,
    leaveCycleName: string,
    leaveCycleStartDate: string,
    leaveCycleEndDate: string,
    hodEmployee: string,
    employeeType?: string,
    enabled: boolean = true
) => {
    return useQuery<HodDashboardResponse>({
        queryKey: ['hodDashboard', entity, session, leaveCycleName, leaveCycleStartDate, leaveCycleEndDate, hodEmployee, employeeType],
        queryFn: () => otherService.getHodDashboard(
            entity,
            session,
            leaveCycleName,
            leaveCycleStartDate,
            leaveCycleEndDate,
            hodEmployee,
            employeeType
        ),
        enabled: enabled && !!entity && !!session && !!hodEmployee,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useHrmMaster = (entityId: string, enabled: boolean = true) => {
    return useQuery<HrmMasterResponse>({
        queryKey: ['hrmMaster', entityId],
        queryFn: () => hrmService.viewHrmMaster(entityId),
        enabled: enabled && !!entityId,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useActiveEmployee = (userId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['activeEmployee', userId],
        queryFn: () => hrmService.getActiveEmployee(userId),
        enabled: enabled && !!userId,
        staleTime: 30 * 60 * 1000,
    });
};

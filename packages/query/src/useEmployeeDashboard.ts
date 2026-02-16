import { useQuery } from '@tanstack/react-query';
import { hrmService } from '@od-erp/api-client';
import { EmployeeDashboardResponse } from '@od-erp/types';

export const useEmployeeDashboardData = (
    entityId: string,
    session: string,
    leaveCycleName: string,
    leaveCycleStartDate: string,
    leaveCycleEndDate: string,
    employeeType?: string,
    enabled: boolean = true
) => {
    return useQuery<EmployeeDashboardResponse>({
        queryKey: ['employeeDashboard', entityId, session, leaveCycleName, leaveCycleStartDate, leaveCycleEndDate, employeeType],
        queryFn: async () => {
            const response = await hrmService.getEmployeeDashboard(
                entityId,
                session,
                leaveCycleName,
                leaveCycleStartDate,
                leaveCycleEndDate,
                employeeType
            );
            return response;
        },
        enabled: enabled && !!entityId && !!session,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@od-erp/api-client';
import { ExaminationDashboardResponse } from '@od-erp/types';

export const useExaminationDashboard = (
    entity: string,
    session: string,
    enabled: boolean = true
) => {
    return useQuery<ExaminationDashboardResponse>({
        queryKey: ['examinationDashboard', entity, session],
        queryFn: () => dashboardService.getExaminationDashboard(entity, session),
        enabled: !!entity && !!session && enabled,
    });
};

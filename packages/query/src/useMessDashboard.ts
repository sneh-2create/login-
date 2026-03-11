import { useQuery } from '@tanstack/react-query';
import { otherService } from '@od-erp/api-client';
import { MessDashboardResponse } from '@od-erp/types';

export const useMessDashboardData = (entity: string, session: string, enabled: boolean = true) => {
    return useQuery<MessDashboardResponse>({
        queryKey: ['messDashboard', entity, session],
        queryFn: () => otherService.getMessDashboardData(entity, session),
        enabled: enabled && !!entity && !!session,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

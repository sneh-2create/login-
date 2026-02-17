import { useQuery } from '@tanstack/react-query';
import { otherService } from '@od-erp/api-client';
import { AnalyticsDashboardFilters, AnalyticsDashboardResponse } from '@od-erp/types';

export const useAnalyticsDashboardData = (
    entity: string,
    session: string,
    filters: AnalyticsDashboardFilters,
    enabled: boolean = true
) => {
    return useQuery<AnalyticsDashboardResponse>({
        queryKey: ['analyticsDashboard', entity, session, filters],
        queryFn: () => otherService.getAnalyticsData(entity, session, filters),
        enabled: enabled && !!entity && !!session && !!filters,
        staleTime: 5 * 60 * 1000,
    });
};

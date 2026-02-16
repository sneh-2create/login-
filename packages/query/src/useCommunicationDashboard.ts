import { useQuery } from '@tanstack/react-query';
import { otherService } from '@od-erp/api-client';
import { CommunicationDashboardResponse } from '@od-erp/types';

export const useCommunicationDashboardData = (
    entity: string,
    session: string,
    enabled: boolean = true
) => {
    return useQuery<CommunicationDashboardResponse>({
        queryKey: ['communicationDashboard', entity, session],
        queryFn: () => otherService.getCommunicationData(entity, session),
        enabled: enabled && !!entity && !!session,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

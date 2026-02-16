import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@od-erp/api-client';
import { AppliedLeave } from '@od-erp/types';

export const useAppliedLeaves = (
    entity: string,
    session: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    enabled: boolean = true
) => {
    return useQuery<AppliedLeave[], Error>({
        queryKey: ['appliedLeaves', entity, session, pageNumber, pageSize],
        queryFn: () => dashboardService.getAppliedLeaves(entity, session, pageNumber, pageSize),
        enabled: enabled && !!entity && !!session,
    });
};

import { useQuery } from '@tanstack/react-query';
import { dashboardService, LibraryDashboardResponse } from '@od-erp/api-client';

export const useLibraryDashboard = (
    entity: string,
    session: string,
    enabled: boolean = true
) => {
    return useQuery<LibraryDashboardResponse, Error>({
        queryKey: ['libraryDashboard', entity, session],
        queryFn: () => dashboardService.getLibraryDashboard(entity, session),
        enabled: enabled && !!entity && !!session,
    });
};

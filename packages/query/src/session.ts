import { useQuery } from '@tanstack/react-query';
import { sessionService } from '@od-erp/api-client';
import { Session } from '@od-erp/types';

export const useSessions = (entityId: string) => {
    return useQuery<Session[]>({
        queryKey: ['sessions', entityId],
        queryFn: () => sessionService.getSessionList(entityId),
        enabled: !!entityId,
        staleTime: Infinity, // Sessions rarely change
    });
};

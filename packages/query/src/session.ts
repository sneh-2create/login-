import { useQuery } from '@tanstack/react-query';
import { Session } from '@od-erp/types';
import { sessionService } from '@od-erp/api-client';

export const useSessions = (entityId: string) => {
    return useQuery<Session[]>({
        queryKey: ['sessions', entityId],
        queryFn: () => sessionService.getSessionList(entityId),
        enabled: !!entityId,
        staleTime: Infinity, // Sessions rarely change
    });
};

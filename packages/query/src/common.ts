import { useQuery } from '@tanstack/react-query';
import { commonService } from '@od-erp/api-client';

export const useEntityPreferences = (entityId: string) => {
    return useQuery({
        queryKey: ['entityPreferences', entityId],
        queryFn: () => commonService.getEntityPreferences(entityId),
        enabled: !!entityId,
    });
};

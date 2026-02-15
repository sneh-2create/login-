import { useQuery } from '@tanstack/react-query';
import { feeMasterService } from '@od-erp/api-client';
import { FeeMaster } from '@od-erp/types';

export const useFeeMaster = (entityId: string, session: string) => {
    return useQuery<FeeMaster, Error>({
        queryKey: ['feeMaster', entityId, session],
        queryFn: () => feeMasterService.viewFeeMaster(entityId, session),
        enabled: !!entityId && !!session,
    });
};

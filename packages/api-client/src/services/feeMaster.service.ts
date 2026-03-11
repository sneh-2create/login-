import { FeeMaster } from '@od-erp/types';
import apiClient from '../client';

export const feeMasterService = {
    viewFeeMaster: async (entityId: string, session: string) => {
        const response = await apiClient.get<FeeMaster>(`/view/feeMaster`, {
            params: {
                entity: entityId,
                session: session
            }
        });
        return response.data;
    }
};

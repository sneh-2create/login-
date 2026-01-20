import apiClient from '../client';
import { session } from '@od-erp/types';

export const sessionService = {
    getSessionList: async (entityId: string) => {
        const response = await apiClient.get<session[]>(`/list/session?entity=${entityId}`);
        return response.data;
    },

    // Keeping this for potential future use or removing if definitely unused
    switchEntity: async (entityId: string) => {
        const response = await apiClient.post('/session/switch-entity', { entityId });
        return response.data;
    }
}


import apiClient from '../client';

export const sessionService = {
    getEntityList: async () => {
        const response = await apiClient.get('/session/entities');
        return response.data;
    },
    getSessionList: async (entityId: string) => {
        const response = await apiClient.get(`/session/list/${entityId}`);
        return response.data;
    },
    switchEntity: async (entityId: string) => {
        // Logic to switch entity usually involves getting new token or updating state
        const response = await apiClient.post('/session/switch-entity', { entityId });
        return response.data;
    }
}

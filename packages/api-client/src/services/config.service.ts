
import apiClient from '../client';

export const configService = {
    getMenuConfig: async () => {
        const response = await apiClient.get('/config/menu');
        return response.data;
    },
    getEntityPreferences: async (entityId: string) => {
        const response = await apiClient.get(`/config/entity-preferences/${entityId}`);
        return response.data;
    }
}

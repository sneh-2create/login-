import apiClient from '../client';
export const commonService = {
    getEntityWebsiteConfig: async (entityId) => {
        const response = await apiClient.get(`/view/entityWebsiteConfig`, { params: { entity: entityId } });
        return response.data;
    },
    getCurrentDate: async () => {
        const response = await apiClient.get(`/getCurrentDate/dashboard`);
        return response.data;
    },
    getWhiteLabellingByURL: async (url) => {
        const response = await apiClient.get(`/getWhiteLabellingByURL`, { params: { url } });
        return response.data;
    },
    getSessionList: async (entityId, showArchived = false) => {
        const response = await apiClient.get(`/list/session`, {
            params: {
                entity: entityId
            }
        });
        return response.data;
    },
    getEntityPreferences: async (entityId) => {
        const response = await apiClient.get(`/view/entityPreferences`, { params: { entity: entityId } });
        return response.data;
    },
    editUserPreferences: async (preferences) => {
        const response = await apiClient.post(`/edit/userPreferences`, preferences);
        return response.data;
    },
    getMessDashboard: async () => {
        const response = await apiClient.get('/getMessMangementDashboard/dashboard');
        return response.data;
    },
    // Legacy mapping: getSessionList1 allows passing entity ID directly as query param string sometimes?
    // Implementing strictly as per usage seen: '/list/session?entity=' +entityId
};

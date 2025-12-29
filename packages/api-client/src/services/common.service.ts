import apiClient from '../client';

export interface EntityWebsiteConfig {
    _id: string;
    entity: string;
    websiteName: string;
    websiteUrl: string;
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    // Add other fields as needed
}

export interface WhiteLabelConfig {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    schoolName: string;
}

export const commonService = {
    getEntityWebsiteConfig: async (entityId: string) => {
        const response = await apiClient.get(`/view/entityWebsiteConfig`, { params: { entity: entityId } });
        return response.data;
    },

    getCurrentDate: async () => {
        const response = await apiClient.get(`/getCurrentDate/dashboard`);
        return response.data;
    },

    getWhiteLabellingByURL: async (url: string) => {
        const response = await apiClient.get(`/getWhiteLabellingByURL`, { params: { url } });
        return response.data;
    },

    getSessionList: async (entityId: string, _showArchived: boolean = false) => {
        const response = await apiClient.get(`/list/session`, {
            params: {
                entity: entityId
            }
        });
        return response.data;
    },

    getEntityPreferences: async (entityId: string) => {
        const response = await apiClient.get(`/view/entityPreferences`, { params: { entity: entityId } });
        return response.data;
    },

    editUserPreferences: async (preferences: any) => {
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

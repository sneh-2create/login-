import apiClient from '../client';

export const communicationService = {
    listCommunicationTemplate: async (entityId: string, templateType: string, communicationType: string) => {
        const response = await apiClient.get(`/list/communicationTemplate`, { 
            params: { 
                entity: entityId, 
                eventType: templateType, 
                channel: communicationType 
            } 
        });
        return response.data;
    },

    viewCommunicationConfig: async (entityId: string, session: string) => {
        const response = await apiClient.get(`/view/communicationConfig`, { 
            params: { 
                entity: entityId, 
                session 
            } 
        });
        return response.data;
    },

    sendMultipleAdmissionReminderSMSCommunication: async (payload: any) => {
        const response = await apiClient.post(`/sendMultipleAdmissionReminderSMS/communication`, payload);
        return response.data;
    },

    sendMultipleAdmissionReminderWhatsAppCommunication: async (payload: any) => {
        const response = await apiClient.post(`/sendMultipleAdmissionReminderWhatsApp/communication`, payload);
        return response.data;
    }
};

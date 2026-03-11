import { useQuery, useMutation } from '@tanstack/react-query';
import { communicationService } from '@od-erp/api-client';

export const useCommunicationTemplates = (
    entityId: string,
    templateType: string,
    communicationType: string
) => {
    return useQuery<any[]>({
        queryKey: ['communicationTemplates', entityId, templateType, communicationType],
        queryFn: () => communicationService.listCommunicationTemplate(entityId, templateType, communicationType),
        enabled: !!entityId && !!templateType && !!communicationType,
        staleTime: 60000 * 5, // 5 minutes
    });
};

export const useCommunicationConfig = (entityId: string, session: string) => {
    return useQuery<any>({
        queryKey: ['communicationConfig', entityId, session],
        queryFn: () => communicationService.viewCommunicationConfig(entityId, session),
        enabled: !!entityId && !!session,
        staleTime: 60000 * 5, // 5 minutes
    });
};

export const useSendAdmissionSms = () => {
    return useMutation({
        mutationFn: communicationService.sendMultipleAdmissionReminderSMSCommunication
    });
};

export const useSendAdmissionWhatsapp = () => {
    return useMutation({
        mutationFn: communicationService.sendMultipleAdmissionReminderWhatsAppCommunication
    });
};

export const useSendAdmissionEmail = () => {
    return useMutation({
        mutationFn: communicationService.sendMultipleAdmissionReminderEmailCommunication
    });
};

export const useSendAdmissionWhatsappWeb = () => {
    return useMutation({
        mutationFn: communicationService.sendMultipleAdmissionReminderWhatsAppWebCommunication
    });
};

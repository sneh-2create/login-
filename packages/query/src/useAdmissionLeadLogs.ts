import { useQuery } from '@tanstack/react-query';
import { admissionLeadLogsService } from '@od-erp/api-client';
import { AdmissionLeadLogPayload } from '@od-erp/types';

export const useAdmissionLeadLogs = (payload: AdmissionLeadLogPayload) => {
    return useQuery({
        queryKey: ['admissionLeadLogs', payload],
        queryFn: () => admissionLeadLogsService.listAdmissionLeadLogs(payload),
        enabled: !!payload.session && !!payload.entity,
    });
};

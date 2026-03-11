import { useQuery } from '@tanstack/react-query';
import { dailyCollectionReportService } from '@od-erp/api-client';
import { AdmissionDailyCollectionReportParams, AdmissionTransaction } from '@od-erp/types';

export const useDailyCollectionReport = (payload: AdmissionDailyCollectionReportParams) => {
    return useQuery<AdmissionTransaction[], Error>({
        queryKey: ['dailyCollectionReport', payload],
        queryFn: () => dailyCollectionReportService.listDailyCollectionReport(payload),
        enabled: !!payload.entity && !!payload.session && !!payload.startDate && !!payload.endDate,
    });
};

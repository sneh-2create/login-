import { useQuery } from '@tanstack/react-query';
import { dailyCollectionReportService } from '@od-erp/api-client';
import { admissionDailyCollectionReportParams, admissionTransaction } from '@od-erp/types';

export const useDailyCollectionReport = (payload: admissionDailyCollectionReportParams) => {
    return useQuery<admissionTransaction[], Error>({
        queryKey: ['dailyCollectionReport', payload],
        queryFn: () => dailyCollectionReportService.listDailyCollectionReport(payload),
        enabled: !!payload.entity && !!payload.session && !!payload.startDate && !!payload.endDate,
    });
};

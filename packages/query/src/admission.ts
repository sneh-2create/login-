
import { useQuery } from '@tanstack/react-query';
import { SourceWiseReportService } from '@od-erp/api-client';
import { SourceWiseReportData } from '@od-erp/types';

export const useSourceWiseReport = (
    entityId: string,
    session: string,
    stageType: 'lead' | 'application',
    startDate?: number,
    endDate?: number,
    source?: string,
    counselorId?: string
) => {
    return useQuery<SourceWiseReportData[]>({
        queryKey: ['sourceWiseReport', entityId, session, stageType, startDate, endDate, source, counselorId],
        queryFn: () => SourceWiseReportService.sourceLeadReport(
            entityId,
            session,
            stageType,
            startDate,
            endDate,
            source,
            counselorId
        ),
        enabled: !!entityId && !!session, // Only fetch if essential params are present
        staleTime: 30000, // 30 seconds refresh as requested
    });
};

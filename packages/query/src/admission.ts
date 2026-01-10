
import { useQuery } from '@tanstack/react-query';
import { sourceWiseReportService, courseWiseTagReportService } from '@od-erp/api-client';
import { SourceWiseReportData, CourseWiseTagReportData } from '@od-erp/types';

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
        queryFn: () => sourceWiseReportService.sourceLeadReport(
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

export const useCourseWiseTagReport = (
    entityId: string,
    session: string,
    counselorId?: string,
    startDate?: number,
    endDate?: number
) => {
    return useQuery<CourseWiseTagReportData[]>({
        queryKey: ['courseWiseTagReport', entityId, session, counselorId, startDate, endDate],
        queryFn: () => courseWiseTagReportService.courseWiseTagReport(
            entityId,
            session,
            counselorId,
            startDate,
            endDate
        ),
        enabled: !!entityId && !!session,
        staleTime: 30000,
    });
};

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { sourceWiseReportService, courseWiseTagReportService, nepSubjectReportService, counselorProductivityReportService, counselorTagReportService, admissionLeadLogsService } from '@od-erp/api-client';
import { SourceWiseReportData, CourseWiseTagReportData, NepSubjectReportData, CounselorProductivityReportData, AdmissionLeadLogResponse, AdmissionLeadLogPayload } from '@od-erp/types';

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


export const useNepSubjectReport = (
    entityId: string,
    session: string,
    course?: string,
    stream?: string,
    batch?: string,
    subjectGroupValue?: string, // e.g. 'mdcCode'
    subjectGroupName?: string // e.g. 'MDC'
) => {
    return useQuery<NepSubjectReportData[]>({
        queryKey: ['nepSubjectReport', entityId, session, course, stream, batch, subjectGroupValue, subjectGroupName],
        queryFn: () => nepSubjectReportService.getNepSubjectReport(
            entityId,
            session,
            course,
            stream,
            batch,
            subjectGroupValue,
            subjectGroupName
        ),
        enabled: !!entityId && !!session,
        staleTime: 30000,
    });
};

export const useCounselorProductivityReport = (
    entityId: string,
    session: string,
    stageType: 'lead' | 'application',
    startDate: number,
    endDate: number,
    counselorId?: string
) => {
    return useQuery<CounselorProductivityReportData[]>({
        queryKey: ['counselorProductivityReport', entityId, session, stageType, startDate, endDate, counselorId],
        queryFn: () => counselorProductivityReportService.getCounselorProductivityReport(
            entityId,
            session,
            stageType,
            startDate,
            endDate,
            counselorId
        ),
        enabled: !!entityId && !!session,
        staleTime: 30000,
    });
};

export const useCounselors = (entityId: string, role?: string) => {
    return useQuery<any[]>({
        queryKey: ['counselors', entityId, role],
        queryFn: () => counselorTagReportService.listEmployee(entityId, role),
        enabled: !!entityId,
        staleTime: 60000 * 5, // 5 minutes cache
    });
};

export const useAdmissionLeadLogs = (payload: AdmissionLeadLogPayload) => {
    return useQuery<AdmissionLeadLogResponse>({
        queryKey: ['admissionLeadLogs', payload],
        queryFn: () => admissionLeadLogsService.listAdmissionLeadLogs(payload),
        enabled: !!payload.entity && !!payload.session,
        placeholderData: keepPreviousData,
    });
};

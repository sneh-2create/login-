import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
import { sourceWiseReportService, courseWiseTagReportService, nepSubjectReportService, counselorProductivityReportService, counselorTagReportService, admissionLeadLogsService, admissionFollowUpService, admissionLeadService } from '@od-erp/api-client';
import { SourceWiseReportData, CourseWiseTagReportData, NepSubjectReportData, CounselorProductivityReportData, AdmissionLeadLogResponse, AdmissionLeadLogPayload, AdmissionFollowUp, AdmissionFollowUpPayload, AdmissionFollowUpStats, AdmissionLeadPayload, AdmissionLead } from '@od-erp/types';

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
        enabled: !!entityId && !!session,
        staleTime: 30000,
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
    subjectGroupValue?: string,
    subjectGroupName?: string
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
        staleTime: 60000 * 5,
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

export const useAdmissionFollowUp = (payload: AdmissionFollowUpPayload) => {
    return useQuery<AdmissionFollowUp[]>({
        queryKey: ['admissionFollowUp', payload],
        queryFn: () => admissionFollowUpService.listFollowUp(payload),
        enabled: !!payload.entity,
        placeholderData: keepPreviousData,
    });
};

export const useAdmissionFollowUpStats = (payload: AdmissionFollowUpPayload) => {
    return useQuery<AdmissionFollowUpStats>({
        queryKey: ['admissionFollowUpStats', payload],
        queryFn: () => admissionFollowUpService.getFilterCountFollowUp(payload),
        enabled: !!payload.entity,
    });
};


export const useAdmissionLeads = (payload: AdmissionLeadPayload) => {
    return useQuery<{ data: AdmissionLead[]; totalCount: number }>({
        queryKey: ['admissionLeads', payload],
        queryFn: () => admissionLeadService.listAdmissionLeads(payload),
        enabled: !!payload.entity,
        placeholderData: keepPreviousData,
    });
};

export const useAddAdmissionLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionLeadService.addAdmissionLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionLeads'] });
        },
    });
};

export const useUpdateAdmissionLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionLeadService.updateAdmissionLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionLeads'] });
        },
    });
};

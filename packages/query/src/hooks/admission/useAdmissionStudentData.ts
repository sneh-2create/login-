import { useQuery } from '@tanstack/react-query';
import { admissionStudentDataService } from '@od-erp/api-client';

/**
 * Hook to fetch fee master data (category and oldNew lists)
 */
export const useViewFeeMasterData = (entityId: string, session: string) => {
    return useQuery({
        queryKey: ['feeMaster', entityId, session],
        queryFn: () => admissionStudentDataService.viewFeeMasterData(entityId, session),
        enabled: !!entityId && !!session,
    });
};

/**
 * Hook to fetch subject combinations based on course, stream, and batch
 */
export const useListSubjectCombination = (
    entityId: string,
    session: string,
    course: string,
    stream: string,
    batch?: string
) => {
    return useQuery({
        queryKey: ['subjectCombination', entityId, session, course, stream, batch],
        queryFn: () => admissionStudentDataService.listSubjectCombinationWithBatch(
            entityId, session, course, stream, batch
        ),
        enabled: !!entityId && !!session && !!course && !!stream,
    });
};

/**
 * Hook to fetch NEP subjects based on course, stream, and batch
 */
export const useListNepSubject = (
    entityId: string,
    session: string,
    course: string,
    stream: string,
    batch?: string
) => {
    return useQuery({
        queryKey: ['nepSubject', entityId, session, course, stream, batch],
        queryFn: () => admissionStudentDataService.listNepSubject(
            entityId, session, course, stream, batch
        ),
        enabled: !!entityId && !!session && !!course && !!stream,
    });
};

/**
 * Hook to fetch partner institutes for the entity
 */
export const useListPartnerInstitute = (entityId: string) => {
    return useQuery({
        queryKey: ['partnerInstitute', entityId],
        queryFn: () => admissionStudentDataService.listPartnerInstitute(entityId),
        enabled: !!entityId,
    });
};

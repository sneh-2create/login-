import { useQuery } from '@tanstack/react-query';
import { admissionStudentDataService } from '@od-erp/api-client';

export const useStudentTimeline = (studentId: string) => {
    return useQuery({
        queryKey: ['studentTimeline', studentId],
        queryFn: () => admissionStudentDataService.getStudentTimeline(studentId),
        enabled: !!studentId,
    });
};

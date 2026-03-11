import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@od-erp/api-client';
import { AttendanceInstituteSummary } from '@od-erp/types';

export const useInstituteAttendanceSummary = (
    entity: string,
    session: string,
    startDate: number,
    endDate: number,
    enabled: boolean = true,
    version: string = 'new'
) => {
    return useQuery<AttendanceInstituteSummary[]>({
        queryKey: ['instituteAttendanceSummary', entity, session, startDate, endDate, version],
        queryFn: () => {
            if (version === 'old') {
                return dashboardService.getInstituteSummary(entity, session, startDate, endDate);
            } else {
                return dashboardService.getInstituteSummaryNew(entity, session, startDate, endDate);
            }
        },
        enabled: enabled && !!entity && !!session && !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

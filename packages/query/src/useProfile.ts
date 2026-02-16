
import { useQuery } from '@tanstack/react-query';
import { otherService } from '@od-erp/api-client';
import { EmployeeProfile, ProfileBirthdayEmployee, Announcement } from '@od-erp/types';

export const useEmployeeDetails = (id: string) => {
    return useQuery<EmployeeProfile>({
        queryKey: ['employeeDetails', id],
        queryFn: () => otherService.viewEmployee(id),
        enabled: !!id,
    });
};

export const useEmployeeBirthdays = (entityId: string) => {
    return useQuery<ProfileBirthdayEmployee[]>({
        queryKey: ['employeeBirthdays', entityId],
        queryFn: () => otherService.getEmployeeBirthday(entityId),
        enabled: !!entityId,
    });
};

export const useEmployeeAnnouncements = (employeeId: string) => {
    return useQuery<Announcement[]>({
        queryKey: ['employeeAnnouncements', employeeId],
        queryFn: () => otherService.listLatestAnnouncemets(employeeId),
        enabled: !!employeeId,
    });
};

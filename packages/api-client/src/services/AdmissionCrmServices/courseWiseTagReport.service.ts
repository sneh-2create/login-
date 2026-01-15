import apiClient from '../../client';

export const courseWiseTagReportService = {
    courseWiseTagReport: async (
        entityId: string,
        session: string,
        counselorId?: string,
        startDate?: number,
        endDate?: number,
    ) => {
        let queryParams = `entity=${entityId}&session=${session}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        if (counselorId) queryParams += `&counselorId=${counselorId}`;

        const response = await apiClient.get(`/courseTagReport/admissionReports?${queryParams}`);
        return response.data;
    }
};

import apiClient from '../../client';

export const counselorProductivityReportService = {
    getCounselorProductivityReport: async (
        entityId: string,
        session: string,
        stageType: 'lead' | 'application',
        startDate: number,
        endDate: number,
        counselorId?: string
    ) => {
        let queryParams = `entity=${entityId}&session=${session}&stageType=${stageType}&startDate=${startDate}&endDate=${endDate}`;
        if (counselorId) queryParams += `&counselor=${counselorId}`;

        const response = await apiClient.get(`/counselorProductivity/admissionReports?${queryParams}`);
        return response.data;
    }
};

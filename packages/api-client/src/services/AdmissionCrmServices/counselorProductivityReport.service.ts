import apiClient from '../../client';

export const counselorProductivityReportService = {
    getCounselorProductivityReport: async (
        entityId: string,
        session: string,
        stageType: 'lead' | 'application',
        startDate?: number,
        endDate?: number,
        counselorId?: string
    ) => {
        let queryParams = `entity=${entityId}&session=${session}&stageType=${stageType}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        if (counselorId) queryParams += `&counselorId=${counselorId}`; // Fixed param name to match Angular analysis: 'counselorId'

        const response = await apiClient.get(`/counselorProductivity/admissionReports?${queryParams}`);
        return response.data;
    }
};

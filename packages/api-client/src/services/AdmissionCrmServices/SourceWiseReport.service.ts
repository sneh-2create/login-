import apiClient from '../../client';

export const SourceWiseReportService = {
    sourceLeadReport: async (
        entityId: string,
        session: string,
        stageType: 'lead' | 'application',
        startDate?: number,
        endDate?: number,
        source?: string,
        counselorId?: string
    ) => {
        let queryParams = `entity=${entityId}&session=${session}&stageType=${stageType}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        if (source) queryParams += `&source=${source}`;
        if (counselorId) queryParams += `&counselorId=${counselorId}`;

        const response = await apiClient.get(`/sourceWiseReport/admissionReports?${queryParams}`);
        return response.data;
    }
};

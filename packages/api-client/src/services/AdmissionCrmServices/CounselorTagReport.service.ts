import apiClient from '../../client';

export const CounselorTagReportService = {
    viewAdmissionMaster: async (entityId: string, session: string) => {
        const response = await apiClient.get(`/view/admissionMaster?entity=${entityId}&session=${session}`);
        return response.data;
    },

    listEmployee: async (entityId: string, role?: string) => {
        let queryParams = `entity=${entityId}`;
        if (role) {
            queryParams += `&role=${role}`;
        }
        const response = await apiClient.get(`/list/Employee?${queryParams}`);
        return response.data;
    },

    counselorTagList: async (entityId: string, session: string, counselorId?: string, startDate?: number, endDate?: number) => {
        let queryParams = `entity=${entityId}&session=${session}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
        if (counselorId) queryParams += `&counselorId=${counselorId}`;

        const response = await apiClient.get(`/counselorTagReport/admissionReports?${queryParams}`);
        return response.data;
    }
};

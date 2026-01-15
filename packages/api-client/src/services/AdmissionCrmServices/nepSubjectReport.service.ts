import apiClient from '../../client';

export const nepSubjectReportService = {
    getNepSubjectReport: async (
        entityId: string,
        session: string,
        course?: string,
        stream?: string,
        batch?: string,
        subjectGroupValue?: string,
        subjectGroupName?: string
    ) => {
        let queryParams = `entity=${entityId}&session=${session}`;
        if (course) queryParams += `&course=${encodeURIComponent(course)}`;
        if (stream) queryParams += `&stream=${stream}`;
        if (batch) queryParams += `&batch=${batch}`;
        if (subjectGroupValue) queryParams += `&groupBy=${subjectGroupValue}`;
        if (subjectGroupName) queryParams += `&nepSubjectType=${subjectGroupName}`;

        const response = await apiClient.get(`/nepSubjectReport/admissionReports?${queryParams}`);
        return response.data;
    }
};

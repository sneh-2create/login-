import { ExcelTemplate } from '@od-erp/types';
import apiClient from '../client';

export const excelTemplateService = {
    listExcelTemplate: async (entityId: string, report: string) => {
        const response = await apiClient.get<ExcelTemplate[]>(`/list/excelTemplate`, {
            params: {
                entity: entityId,
                report: report
            }
        });
        return response.data;
    },

    viewExcelTemplate: async (id: string) => {
        const response = await apiClient.get<ExcelTemplate>(`/view/excelTemplate`, {
            params: {
                id: id
            }
        });
        return response.data;
    },

    viewDefaultExcelTemplates: async (report: string, entityType: string) => {
        const response = await apiClient.get<ExcelTemplate>(`/viewDefault/defaultExcelTemplate`, {
            params: {
                report: report,
                entityType: entityType
            }
        });
        return response.data;
    },

    editExcelTemplate: async (payload: Partial<ExcelTemplate> & { _id: string }) => {
        const response = await apiClient.post<ExcelTemplate>(`/edit/excelTemplate`, payload);
        return response.data;
    },

    addExcelTemplate: async (payload: Omit<ExcelTemplate, '_id'>) => {
        const response = await apiClient.post<ExcelTemplate>(`/add/excelTemplate`, payload);
        return response.data;
    },
};

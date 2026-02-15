import { useQuery } from '@tanstack/react-query';
import { excelTemplateService } from '@od-erp/api-client';
import { ExcelTemplate } from '@od-erp/types';

export const useExcelTemplates = (entityId: string, report: string) => {
    return useQuery<ExcelTemplate[], Error>({
        queryKey: ['excelTemplates', entityId, report],
        queryFn: () => excelTemplateService.listExcelTemplate(entityId, report),
        enabled: !!entityId && !!report,
    });
};

export const useExcelTemplate = (id: string) => {
    return useQuery<ExcelTemplate, Error>({
        queryKey: ['excelTemplate', id],
        queryFn: () => excelTemplateService.viewExcelTemplate(id),
        enabled: !!id,
    });
};

export const useDefaultExcelTemplates = (report: string, entityType: string) => {
    return useQuery<ExcelTemplate, Error>({
        queryKey: ['defaultExcelTemplates', report, entityType],
        queryFn: () => excelTemplateService.viewDefaultExcelTemplates(report, entityType),
        enabled: !!report,
    });
};
